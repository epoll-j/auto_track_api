import { Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { BaseService } from '@cool-midway/core';
import { Book } from '../entity/book';
import { KeyPoint } from '../entity/key_point';
import { Track } from '../entity/track';
import { AppUser } from '../entity/app_user';

const SearchType = {
  WEEKLY_HIGHLIGHTS: 0,
  EXPLORE: 1,
  CONTINUE: 2,
  SAVE_FOR_LATER: 3,
};

@Provide()
export class BookService extends BaseService {
  @InjectEntityModel(Book)
  bookRepo: Repository<Book>;

  @InjectEntityModel(KeyPoint)
  keyPointRepo: Repository<KeyPoint>;

  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @InjectEntityModel(AppUser)
  userRepo: Repository<AppUser>;

  @Inject()
  ctx;

  async getBookList(type: number, tag?: string) {
    const { user } = this.ctx;
    let bookList = [];

    if (tag) {
      bookList = await this.bookRepo
        .createQueryBuilder('book')
        .where('book.book_status = :status', { status: 1 })
        .andWhere('JSON_CONTAINS(tags, JSON_ARRAY(:tag))', { tag })
        .orderBy('book.sort_by', 'DESC')
        .getMany();
    } else {
      const intType = parseInt(type.toString(), 10);
      if (
        [SearchType.WEEKLY_HIGHLIGHTS, SearchType.EXPLORE].includes(intType)
      ) {
        const searchTag =
          intType === SearchType.WEEKLY_HIGHLIGHTS ? 'WEEKLY' : 'EXPLORE';
        bookList = await this.bookRepo
          .createQueryBuilder('book')
          .where('book.book_status = :status', { status: 1 })
          .andWhere('JSON_CONTAINS(tags, JSON_ARRAY(:tag))', { tag: searchTag })
          .orderBy('book.sort_by', 'DESC')
          .getMany();
      } else if (
        [SearchType.CONTINUE, SearchType.SAVE_FOR_LATER].includes(intType) &&
        user
      ) {
        const userId = user.user_id;
        let trackList = [];
        if (intType === SearchType.CONTINUE) {
          trackList = await this.trackRepo.find({
            where: {
              user_id: userId,
              content_type: 0,
              track_type: 0,
            },
            order: {
              update_time: 'DESC',
            },
            take: 15,
          });
        } else {
          trackList = await this.trackRepo
            .createQueryBuilder('track')
            .where('track.user_id = :userId', { userId: userId })
            .andWhere('track.content_type = :contentType', { contentType: 0 })
            .andWhere('track.track_type = :trackType', { trackType: 1 })
            .andWhere('JSON_VALUE(track.param, "$.late") = 1')
            .orderBy('track.update_time', 'DESC')
            .take(15)
            .getMany();
        }
        const idList = trackList.map(t => t.content_id);
        if (idList.length > 0) {
          bookList = await this.bookRepo.find({
            where: {
              book_status: 1,
              id: In(idList),
            },
            order: {
              sort_by: 'DESC',
            },
          });
        }
      }
    }

    const result = [];
    for (const item of bookList) {
      const keyPoint = await this.keyPointRepo.find({
        where: { point_status: 1, book_id: item.id },
        order: { sort_by: 'DESC' },
        select: ['id', 'audio_time', 'title'],
      });

      if (user) {
        const progressIndex = await this.trackRepo.findOne({
          where: {
            user_id: user.user_id,
            content_type: 0,
            track_type: 0,
            content_id: item.id,
          },
          select: ['param'],
        });
        if (progressIndex) {
          item['progress_index'] = Number(progressIndex.param.index);
        }
      }

      result.push({
        ...item,
        key_point: keyPoint,
      });
    }

    return result;
  }

  async searchBook(keyword: string) {
    const bookList = await this.bookRepo
      .createQueryBuilder('book')
      .where('book.book_status = :status', { status: 1 })
      .andWhere(
        new Brackets(qb => {
          qb.where('JSON_CONTAINS(book.tags, :keyword)', {
            keyword: JSON.stringify(keyword),
          })
            .orWhere('book.title LIKE :title', { title: `%${keyword}%` })
            .orWhere('book.author LIKE :author', { author: `%${keyword}%` })
            .orWhere('book.inside LIKE :inside', { inside: `%${keyword}%` })
            .orWhere('book.book_desc LIKE :desc', { desc: `%${keyword}%` });
        })
      )
      .orderBy('book.sort_by', 'DESC')
      .getMany();

    const result = [];
    for (const item of bookList) {
      const keyPoint = await this.keyPointRepo.find({
        where: { point_status: 1, book_id: item.id },
        order: { sort_by: 'DESC' },
        select: ['id', 'audio_time', 'title'],
      });

      result.push({
        ...item,
        key_point: keyPoint,
      });
    }

    return result;
  }

  async getBookDetail(id: number) {
    const { user } = this.ctx;
    const book = await this.bookRepo.findOne({
      where: { id },
      select: [
        'id',
        'title',
        'sub_title',
        'author',
        'inside',
        'book_desc',
        'cover',
        'about_author',
        'learn',
        'reading_time',
        'second_author',
        'is_free',
      ],
    });

    if (!book) {
      return null;
    }

    const keyPoint = await this.keyPointRepo.find({
      where: { point_status: 1, book_id: book.id },
      select: ['id', 'audio_time', 'audio_url', 'title', 'content'],
      order: { sort_by: 'DESC' },
    });
    if (user) {
      const progressIndex = await this.trackRepo.findOne({
        where: {
          user_id: user.user_id,
          content_type: 0,
          track_type: 0,
          content_id: `${id}`,
        },
        select: ['param'],
      });
      if (progressIndex) {
        book['progress_index'] = Number(progressIndex.param.index);
      }
      const late = await this.trackRepo.findOne({
        where: {
          user_id: user.user_id,
          content_type: 0,
          track_type: 1,
          content_id: `${id}`,
        },
        select: ['param'],
      });
      book['late'] = late ? Number(late.param.late) : 0;
    }

    return {
      ...book,
      key_point: keyPoint.map((item: any) => ({
        ...item,
        content: JSON.stringify(item.content),
      })),
      free: book.is_free === 1,
    };
  }

  async insertBook(book: any) {
    const newBook = this.bookRepo.create({
      title: book.title,
      sub_title: book.sub_title || '',
      reading_time: book.reading_time || 15,
      book_desc: book.book_desc || 'desc',
      inside: book.inside || 'inside',
      cover:
        book.cover ||
        `http://cdn.iflow.mobi/jianshu/book/${book.title}/cover.png`,
      author: book.author || 'author',
      about_author: book.about_author || 'about_author',
      second_author: book.second_author,
      learn: JSON.stringify(book.learn || 'learn').replace(/^"|"$/g, ''),
      tags: book.tags || [],
    });

    const bookEntity = await this.bookRepo.save(newBook);
    const keyPoints = book.key_point;
    let index = 1;

    for (const item of keyPoints) {
      await this.keyPointRepo.save({
        audio_url:
          item.audio_url ||
          `http://cdn.iflow.mobi/jianshu/book/${book.title}/${index}.wav`,
        audio_time: item.audio_time || 0,
        title: item.title,
        content: item.content,
        book_id: bookEntity.id,
      });
      index += 1;
    }

    return 'success';
  }

  async delete(ids) {
    let idArr;
    if (ids instanceof Array) {
      idArr = ids;
    } else {
      idArr = ids.split(',');
    }
    await this.bookRepo.delete({ id: In(idArr) });
    await this.keyPointRepo.delete({ book_id: In(idArr) });
  }
}
