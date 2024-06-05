import { Inject, Provide, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { DictInfoService } from '../../../dict/service/info';

@Provide()
@CoolController('/api/open')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  dictInfoService: DictInfoService;

  @Get('/config')
  async getConfig() {
    const config: any = await this.dictInfoService.data(['ds']);
    return this.ok(JSON.parse(config.ds[0].value));
  }
}
