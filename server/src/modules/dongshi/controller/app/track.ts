import { Inject, Provide, Post, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { TrackService } from '../../service/track';

@Provide()
@CoolController('/api')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  trackService: TrackService;

  @Post('/v1/track')
  async addTrack(
    @Body()
    body: {
      content_type: string;
      content_id: string;
      track_type: string;
      param: string;
    }
  ) {
    await this.trackService.create(body);
    return this.ok();
  }
}
