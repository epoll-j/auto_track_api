import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as _ from 'lodash';
import { AppInfo } from '../entity/track_app_info';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Caching } from '@midwayjs/cache-manager';
import { TrackUser } from '../entity/track_user';

@Provide()
export class AppInfoService extends BaseService {
  @InjectEntityModel(AppInfo)
  appInfoEntity: Repository<AppInfo>;
  @InjectEntityModel(TrackUser)
  trackUserEntity: Repository<TrackUser>;

  @Caching('default', 'appTrackInfo', 1000 * 60)
  async getInfo(appKey: string) {
    const appInfo = await this.appInfoEntity.findOneBy({
      appKey,
      appStatus: 1,
    });

    return appInfo;
  }

  @Caching('default', 'appTrackUser', 1000 * 60)
  async getUser(appKey: string, userId: string) {
    const user = await this.trackUserEntity.findOneBy({
      appKey,
      userId,
    });

    return user;
  }
}
