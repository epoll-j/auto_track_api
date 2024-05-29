import { Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import moment from 'moment';
import { BaseService } from '@cool-midway/core';
import { AppInfo } from '../entity/track_app_info';
import { TrackStatistics } from '../entity/track_statistics';
import { TrackInfo } from '../entity/track_info';
import { TrackUser } from '../entity/track_user';

export class DataStatisticsService extends BaseService {
  @Inject()
  redis: RedisService;
  @InjectEntityModel(AppInfo)
  appInfoModel: Repository<AppInfo>;
  @InjectEntityModel(TrackStatistics)
  statisticsModel: Repository<TrackStatistics>;
  @InjectEntityModel(TrackInfo)
  userTrackModel: Repository<TrackInfo>;
  @InjectEntityModel(TrackUser)
  appUserModel: Repository<TrackUser>;

  async run() {
    const apps = await this.appInfoModel.findBy({
      appStatus: 1,
    });

    for (const app of apps) {
      const appKey = app.appKey;
      const dauKey = `${appKey}:dau`;
      const nuKey = `${appKey}:nu`;

      const dau = (await this.redis.bitcount(dauKey)) || 0;
      const nu = (await this.redis.get(nuKey)) || 0;
      const tu = await this.appUserModel.countBy({
        appKey,
      });

      const trackCount = await this.userTrackModel
        .createQueryBuilder('user_track')
        .select('user_track.trackKey', 'track_key')
        .addSelect('user_track.trackType', 'track_type')
        .addSelect('COUNT(user_track.id)', 'num')
        .where(
          'DATE(user_track.createTime) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
        )
        .groupBy('user_track.trackKey')
        .addGroupBy('user_track.trackType')
        .getRawMany();

      const statistics = new TrackStatistics();
      statistics.appKey = appKey;
      statistics.appDau = Number(dau || 0);
      statistics.appNu = Number(nu || 0);
      statistics.appTu = Number(tu || 0);
      statistics.otherParams = JSON.stringify(trackCount);
      statistics.dataTime = moment().subtract(1, 'days').toDate();
      await this.statisticsModel.insert(statistics);
      await this.redis.del(dauKey);
      await this.redis.del(nuKey);
    }
  }
}
