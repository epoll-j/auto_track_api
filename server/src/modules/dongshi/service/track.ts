import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { BaseService } from '@cool-midway/core';
import { Track } from '../entity/track';
import { AppUser } from '../entity/app_user';

@Provide()
export class TrackService extends BaseService {
  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @InjectEntityModel(AppUser)
  userRepo: Repository<AppUser>;

  @Inject()
  ctx: Context;

  async create(body: any) {
    const { content_type, content_id, track_type, param } = body;
    const { user, deviceId } = this.ctx;

    const userId = user ? user.user_id : '';
    const paramString = JSON.stringify(param);

    // 查找是否存在记录
    let track = await this.trackRepo.findOne({
      where: {
        user_id: userId,
        content_type,
        content_id,
        track_type,
        device_id: deviceId,
      },
    });

    if (track) {
      // 如果存在，则更新
      track.last_param = track.param;
      track.param = paramString;
    } else {
      // 如果不存在，则创建新记录
      track = this.trackRepo.create({
        user_id: userId,
        content_type,
        content_id,
        track_type,
        param: paramString,
        device_id: deviceId,
      });
    }

    // 保存
    await this.trackRepo.save(track);
    return { success: true };
  }
}
