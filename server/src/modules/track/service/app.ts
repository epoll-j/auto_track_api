import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as _ from 'lodash';
import { AppInfo } from '../entity/track_app_info';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Caching } from '@midwayjs/cache-manager';
import { TrackUser } from '../entity/track_user';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class AppInfoService extends BaseService {
  @InjectEntityModel(AppInfo)
  appInfoEntity: Repository<AppInfo>;
  @InjectEntityModel(TrackUser)
  trackUserEntity: Repository<TrackUser>;
  @Inject()
  redis: RedisService;

  @Caching('default', 'appTrackInfo', 1000 * 60)
  async getInfo(appKey: string) {
    const appInfo = await this.appInfoEntity.findOneBy({
      appKey,
      appStatus: 1,
    });

    return appInfo;
  }

  async getUser(appKey: string, userId: string) {
    const key = `${appKey}:user:${userId}`;
    const result = await this.redis.get(key);
    if (!result) {
      const user = await this.trackUserEntity.findOneBy({
        appKey,
        userId,
      });

      if (user) {
        await this.redis.set(key, JSON.stringify(user), 'EX', 60 * 5);
      }
      return user;
    } else {
      return JSON.parse(result);
    }
  }
}

