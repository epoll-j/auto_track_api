import {
  Provide,
  Get,
  Post,
  Query,
  Param,
  Body,
  Inject,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { BaseController, CoolController } from '@cool-midway/core';
import { BookService } from '../../service/book';

@Provide()
@CoolController('/api')
export class BookController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  bookService: BookService;

  @Get('/v1/book')
  async index(@Query() type: number, @Query() tag: string) {
    const result = await this.bookService.getBookList(type, tag);
    return this.ok(result);
  }

  @Get('/v1/book/:id')
  async show(@Param() id: number) {
    const result = await this.bookService.getBookDetail(id);
    return this.ok(result);
  }

  @Post('/v1/book')
  async create(@Body() body: any) {
    const result = await this.bookService.insertBook(body);
    return this.ok(result);
  }

  @Get('/book/search')
  async search(@Query() keyword: string) {
    const result = await this.bookService.searchBook(keyword);
    return this.ok(result);
  }
}
