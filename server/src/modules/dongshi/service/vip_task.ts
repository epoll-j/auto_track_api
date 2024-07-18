import { Logger, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as moment from 'moment';
import { LessThan, Not, Repository } from 'typeorm';
import { AppUser } from '../entity/app_user';
import { Track } from '../entity/track';
import { InjectEntityModel } from '@midwayjs/typeorm';

/**
 * 描述
 */
@Provide()
export class VipTaskService extends BaseService {
  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @InjectEntityModel(AppUser)
  userRepo: Repository<AppUser>;

  async checkTime() {
    const content_id = moment().format('YYYY-MM-DD');
    const expiredUsers = await this.userRepo.find({
      where: {
        vip_type: Not(0),
        expiration_time: LessThan(new Date()),
      },
    });

    for (const user of expiredUsers) {
      const track = new Track();
      track.user_id = `${user.id}`;
      track.content_type = 1;
      track.content_id = content_id;
      track.track_type = 1;
      track.param = JSON.stringify({
        last_vip: user.vip_type,
        new_vip: 0,
      });

      user.vip_type = 0;
      user.expiration_time = null;
      await this.userRepo.save(user);

      await this.trackRepo.save(track);
    }
    return '会员状态更新任务执行完成';
  }
}
