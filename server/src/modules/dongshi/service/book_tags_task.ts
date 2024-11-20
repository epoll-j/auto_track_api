import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { IsNull, Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Book } from '../entity/book';
import axios from 'axios';
import { Track } from '../entity/track';
import { RedisService } from '@midwayjs/redis';
import { TfIdf } from 'natural';

@Provide()
export class BookTagsTaskService extends BaseService {
  @InjectEntityModel(Book)
  bookRepo: Repository<Book>;
  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;
  @Inject()
  redis: RedisService;
  @Config('module.dongshi.tyqw')
  apiKey: string;

  async setTags() {
    const tagSet = new Set();
    const tagsList = await this.bookRepo.find({ select: ['recommend_tags'] });
    for (const tags of tagsList) {
      tags.recommend_tags.forEach(element => {
        tagSet.add(element);
      });
    }
    const bookList = await this.bookRepo.find({
      where: { recommend_tags: IsNull() },
      select: ['id', 'title', 'book_desc', 'inside', 'author', 'about_author'],
    });

    for (const book of bookList) {
      try {
        const result = await axios.post(
          'https://dashscope.aliyuncs.com/api/v1/apps/adb480aff3f14429a239e2f3edf62dfa/completion',
          {
            input: {
              prompt: 'hello',
              biz_params: {
                book_info: book,
                tag_databese: tagSet,
              },
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            timeout: 1000 * 120,
          }
        );
        let newTags = JSON.parse(
          result.data.output.text.replace(/```json\s*|\s*```/g, '').trim()
        );
        if (!Array.isArray(newTags)) {
          newTags = newTags['替换后的标签组'];
        }
        await this.bookRepo.update(book.id, { recommend_tags: newTags });
        newTags.forEach(element => {
          tagSet.add(element);
        });
      } catch (error) {
        console.log(error);
      }
    }

    return '设置标签成功';
  }

  async setRecommendations() {
    const bookList = await this.bookRepo.findBy({ book_status: 1 });
    const recommendations = [];
    const tfidf = new TfIdf();
    for (const book of bookList) {
      const trackList = await this.trackRepo.findBy({
        track_type: 0,
        content_type: 0,
        content_id: `${book.id}`,
      });

      if (!book.recommend_tags || book.recommend_tags.length === 0) {
        continue;
      }

      let finishCount = 0;
      for (const track of trackList) {
        if (track.param && track.param.finish === 1) {
          finishCount++;
        }
      }

      recommendations.push({
        id: book.id,
        title: book.title,
        tags: book.recommend_tags,
        completion_rate: finishCount / trackList.length || 0,
      });
    }

    await this.redis.set(
      'book:recommendations',
      JSON.stringify(recommendations)
    );
    return '设置推荐列表';
  }

  async updateUserRecommendations() {
    const key = 'book:recommendations';
    const userIdList = await this.redis.smembers(`${key}:update`);
    let books: any = await this.redis.get('book:recommendations');
    if (!books) {
      return '完播率列表为空';
    }
    await this.redis.del(`${key}:update`);
    for (const userId of userIdList) {
      const trackList = await this.trackRepo.find({
        where: {
          user_id: userId,
          content_type: 0,
          track_type: 0,
        },
        order: {
          update_time: 'DESC',
        },
        select: ['content_id'],
        take: 5,
      });

      if (trackList.length <= 0) {
        continue;
      }
      const userReadBooks = trackList.map(t => Number(t.content_id));
      books = JSON.parse(books);
      const recommendations = {};
      const tfidf = new TfIdf();

      books.forEach(book => {
        tfidf.addDocument(book.tags);
      });
      userReadBooks.forEach(bookId => {
        const idx = books.findIndex(book => book.id === bookId);
        if (idx !== -1) {
          const scores = tfidf.tfidfs(books[idx].tags);
          books.forEach((book, i) => {
            if (!userReadBooks.includes(book.id)) {
              recommendations[book.id] =
                (recommendations[book.id] || 0) +
                scores[i] +
                book.completion_rate * 100 * 0.1;
            }
          });
        }
      });
      await this.redis.set(
        `${key}:${userId}`,
        JSON.stringify(
          Object.entries(recommendations)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 15)
            .map(entry => parseInt(entry[0]))
        )
      );
    }
    return '更新用户推荐列表';
  }
}
