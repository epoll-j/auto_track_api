import { Inject, Provide, Get, Post, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';

@Provide()
@CoolController('/api')
export class ErrorController extends BaseController {
  @Inject()
  ctx: Context;

  @Post('/error')
  async handlerError(@Body() body) {
    console.log(body);
    return this.ok();
  }
}
