import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { BaseService } from '@cool-midway/core';
import { BookCollection } from '../entity/book_collection';

@Provide()
export class CollectionService extends BaseService {
  @InjectEntityModel(BookCollection)
  collectionRepo: Repository<BookCollection>;

  @Inject()
  ctx: Context;

  async getList(page: number, size: number) {
    return await this.collectionRepo.find({
      where: {
        status: 1,
      },
      select: ['id', 'title', 'cover', 'summary', 'details', 'book_ids'],
      order: {
        sort_by: 'DESC',
        id: 'DESC',
      },
      skip: (page - 1) * size,
      take: size,
    });
  }
}
