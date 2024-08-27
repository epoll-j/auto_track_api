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
import { CoolController } from '@cool-midway/core';
import { BookService } from '../../service/book';
import BaseController from '../base_controller';

@Provide()
@CoolController('/api')
export class BookController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  bookService: BookService;

  @Get('/v1/book')
  async index(
    @Query('type') type: number,
    @Query('tag') tag: string,
    @Query('page') page?: number,
    @Query('size') size?: number
  ) {
    const result = await this.bookService.getBookList(
      type,
      tag,
      page || 1,
      size || 30
    );
    return this.ok(result);
  }

  @Get('/v1/book/:id')
  async show(@Param('id') id: number) {
    const result = await this.bookService.getBookDetail(id);
    return this.ok(result);
  }

  @Post('/v1/book')
  async create(@Body() body: any) {
    const result = await this.bookService.insertBook(body);
    return this.ok(result);
  }

  @Get('/book/search')
  async search(
    @Query('keyword') keyword: string,
    @Query('page') page?: number,
    @Query('size') size?: number
  ) {
    const result = await this.bookService.searchBook(
      keyword,
      page || 1,
      size || 30
    );
    return this.ok(result);
  }
}
