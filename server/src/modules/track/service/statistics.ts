import { Inject, Provide } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { BaseService } from '@cool-midway/core';
import { AppInfo } from '../entity/track_app_info';
import { TrackStatistics } from '../entity/track_statistics';
import { TrackInfo } from '../entity/track_info';
import { TrackUser } from '../entity/track_user';

@Provide()
export class DataStatisticsService extends BaseService {
  @Inject()
  redis: RedisService;
  @InjectEntityModel(AppInfo)
  appInfoModel: Repository<AppInfo>;
  @InjectEntityModel(TrackStatistics)
  statisticsModel: Repository<TrackStatistics>;
  @InjectEntityModel(TrackInfo)
  trackInfoModel: Repository<TrackInfo>;
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

      const trackCount = await this.trackInfoModel
        .createQueryBuilder('track_info')
        .select('track_info.trackKey', 'track_key')
        .addSelect('track_info.trackType', 'track_type')
        .addSelect('COUNT(track_info.id)', 'num')
        .where(
          'DATE(track_info.createTime) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
        )
        .groupBy('track_info.trackKey')
        .addGroupBy('track_info.trackType')
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

      return '日活统计成功';
    }
  }
}
