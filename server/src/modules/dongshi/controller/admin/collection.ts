import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { BookCollection } from '../../entity/book_collection';

/**
 * 合集
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BookCollection,
  pageQueryOp: {
    addOrderBy: {
      sort_by: 'desc',
      id: 'asc',
    },
  },
})
export class BookCollectionController extends BaseController {}
