import { Inject, Provide, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';

import { CollectionService } from '../../service/collection';

@Provide()
@CoolController('/api')
export class CollectionController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  collectionService: CollectionService;

  @Get('/collection')
  async getBanner(@Query('page') page?: number, @Query('size') size?: number) {
    return this.ok(await this.collectionService.getList(page || 1, size || 5));
  }
}
