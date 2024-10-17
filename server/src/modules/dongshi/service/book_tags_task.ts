import { Config, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { IsNull, Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Book } from '../entity/book';
import axios from 'axios';
/**
 * 描述
 */
@Provide()
export class BookTagsTaskService extends BaseService {
  @InjectEntityModel(Book)
  bookRepo: Repository<Book>;
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
}
