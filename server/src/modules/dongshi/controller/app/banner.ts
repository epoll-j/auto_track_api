import { Inject, Provide, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { BannerService } from '../../service/banner';

@Provide()
@CoolController('/api')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  bannerService: BannerService;

  @Get('/v1/open/banner')
  async getBanner() {
    return this.ok(
      (await this.bannerService.getList()).map(item => {
        return {
          id: item.id,
          img_url: item.img_url,
          jump_type: item.jump_type,
          param: JSON.stringify(item.param),
        };
      })
    );
  }
}
