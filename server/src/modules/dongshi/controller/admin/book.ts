import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { Book } from '../../entity/book';
import { BookService } from '../../service/book';

/**
 * 书本列表
 */
@Provide()
@CoolController({
  api: ['delete', 'update', 'info', 'page'],
  entity: Book,
  service: BookService,
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    // fieldEq: ['dataType'],
  },
})
export class BookController extends BaseController {
  @Inject()
  bookService: BookService;

  @Post('/create')
  async create(@Body() body: any) {
    const result = await this.bookService.insertBook(body);
    return this.ok(result);
  }
}
