import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { AppInfoService } from '../../service/app';
import { TrackDTO } from '../../dto/track';
import { RedisService } from '@midwayjs/redis';
import * as crypto from 'crypto';
import { TrackService } from '../../service/track';

@Provide()
@CoolController('/api')
export class AppUserAddressController extends BaseController {
  @Inject()
  appInfoService: AppInfoService;
  @Inject()
  trackService: TrackService;
  @Inject()
  redis: RedisService;
  @Inject()
  ctx;

  @Post('/track')
  async default(@Body() body: TrackDTO) {
    const appInfo = await this.appInfoService.getInfo(body.app_key);
    if (!appInfo) {
      return this.ok(false);
    }
    const tKey = `track:${body.app_key}:${
      body.user_id || `uid${body.unique_id}`
    }:${body.t}`;
    if (
      (await this.redis.get(tKey)) ||
      (Number(body.t) > 1000000000000 &&
        new Date().getTime() - Number(body.t) > 1000 * 60)
    ) {
      return this.ok(false);
    }

    const sign = crypto
      .createHash('sha256')
      .update(`${body.app_key}${body.t}${appInfo.appSecret}`)
      .digest('hex');
    if (body.signature !== sign) {
      return this.ok(false);
    }
    this.redis.setex(tKey, 60 * 5, 1);
    await this.trackService.add(body);
    return this.ok(true);
  }
}
