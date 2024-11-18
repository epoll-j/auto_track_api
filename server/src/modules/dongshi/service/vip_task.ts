import { Inject, Logger, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as moment from 'moment';
import { In, LessThan, Not, Repository } from 'typeorm';
import { AppUser } from '../entity/app_user';
import { Track } from '../entity/track';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { RedisService } from '@midwayjs/redis';
import { ApnsService } from './apns';
import { UserChallenge } from '../entity/user_challenge';

/**
 * 描述
 */
@Provide()
export class VipTaskService extends BaseService {
  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @InjectEntityModel(AppUser)
  userRepo: Repository<AppUser>;

  @InjectEntityModel(UserChallenge)
  userChallengeRepo: Repository<UserChallenge>;

  @Inject()
  apnsService: ApnsService;

  @Inject()
  redis: RedisService;

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

    const finishIdList = await this.redis.smembers('user_challenge_finish');
    await this.redis.del('user_challenge_finish');
    await this.userChallengeRepo.update(
      { id: In(finishIdList.map(item => Number(item))) },
      { status: 1 }
    );

    await this.userChallengeRepo
      .createQueryBuilder()
      .update(UserChallenge)
      .set({ daily_finish: 0 })
      .execute();

    return '会员状态更新任务执行完成';
  }

  async pushRenewApns() {
    const key = `iap_notice#${moment().format('YYYY-MM-DD')}`;
    const userIdList = await this.redis.smembers(key);
    if (userIdList && userIdList.length != 0) {
      await this.apnsService.send(userIdList, {
        alert: {
          body: '2天后即将成为正式会员',
          title: '🔔订阅提醒',
          subTitle: '',
        },
        category: 'mutable',
        attachmentUrl: '',
        mutableContent: true,
      });
    }
    await this.redis.del(key);
    return `会员订阅提醒通知【${userIdList}】`;
  }
}
