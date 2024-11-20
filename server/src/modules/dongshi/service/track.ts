import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { BaseService } from '@cool-midway/core';
import { Track } from '../entity/track';
import { AppUser } from '../entity/app_user';
import { Challenge } from '../entity/challenge';
import { UserChallenge } from '../entity/user_challenge';
import { KeyPoint } from '../entity/key_point';
import { RedisService } from '@midwayjs/redis';
import { ApnsService } from './apns';

@Provide()
export class TrackService extends BaseService {
  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @InjectEntityModel(AppUser)
  userRepo: Repository<AppUser>;

  @InjectEntityModel(Challenge)
  challengeRepo: Repository<Challenge>;

  @InjectEntityModel(UserChallenge)
  userChallengeRepo: Repository<UserChallenge>;

  @InjectEntityModel(KeyPoint)
  keyPointRepo: Repository<KeyPoint>;

  @Inject()
  apnsService: ApnsService;

  @Inject()
  redis: RedisService;

  @Inject()
  ctx: Context;

  async create(body: any) {
    const { content_type, content_id, track_type, param } = body;
    const { user, deviceId } = this.ctx;

    const userId = user ? user.user_id : '';
    // const paramString = JSON.stringify(param);

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
      track.param = param;
    } else {
      // 如果不存在，则创建新记录
      track = this.trackRepo.create({
        user_id: userId,
        content_type,
        content_id,
        track_type,
        param: param,
        device_id: deviceId,
      });
    }

    // 保存
    await this.trackRepo.save(track);
    // 处理挑战进度
    if (content_type === 0 && track_type === 0) {
      // 更新推荐内容
      await this.redis.sadd('book:recommendations:update', userId);
      const challengeList = await this.challengeRepo
        .createQueryBuilder('challenge')
        .where('challenge.status = :status', { status: 1 })
        .andWhere('JSON_CONTAINS(book_ids, JSON_ARRAY(:id))', {
          id: content_id,
        })
        .getMany();
      if (challengeList && challengeList.length > 0) {
        for (const challenge of challengeList) {
          const userChallenge = await this.userChallengeRepo.findOneBy({
            user_id: userId,
            challenge_id: challenge.id,
            status: LessThan(1),
          });
          if (userChallenge) {
            const index = challenge.book_ids.indexOf(content_id);
            const bookIndex = param.index;
            const keyPointCount = await this.keyPointRepo.countBy({
              book_id: content_id,
            });
            const currentProgress = Math.min(bookIndex / keyPointCount, 1);
            if (currentProgress > userChallenge.challenge_progress[index]) {
              userChallenge.challenge_progress[index] = currentProgress;
              // 阅读第一本开始挑战
              if (userChallenge.challenge_progress[0] > 0) {
                userChallenge.status = 0;
              }
              if (currentProgress === 1) {
                if (index === 0) {
                  userChallenge.daily_finish = 1;
                } else {
                  if (userChallenge.challenge_progress[index - 1] >= 1) {
                    userChallenge.daily_finish = 1;
                  }
                }
              }
              const progress =
                userChallenge.challenge_progress.reduce((pre, cur) => {
                  return pre + cur;
                }) / challenge.book_ids.length;

              let middleNotification = true;
              for (
                let i = 0;
                i < userChallenge.challenge_progress.length / 2;
                i++
              ) {
                if (userChallenge.challenge_progress[i] < 1) {
                  middleNotification = false;
                  break;
                }
              }
              if (middleNotification) {
                const key = `user_challenge_middle_notification:${challenge.id}:${userId}`;
                const exist = await this.redis.get(key);
                if (!exist) {
                  await this.apnsService.send(userId, {
                    alert: {
                      body: '每天阅读一点，改变就在发生！',
                      title: '👍🏻完成一半，里目标更近一步！',
                      subTitle: '',
                    },
                  });
                  await this.redis.setex(key, 60 * 60 * 24 * 30, '1');
                }
              }

              if (progress >= 1) {
                // 完成挑战
                await this.redis.sadd(
                  'user_challenge_finish',
                  userChallenge.id
                );
                await this.apnsService.send(userId, {
                  alert: {
                    body: '还有更多知识等你探索，下一个挑战已准备好！',
                    title: `🏆恭喜完成${challenge.title}`,
                    subTitle: '',
                  },
                });
              }
              userChallenge.update_time = null;
              await this.userChallengeRepo.save(userChallenge);
            }
          }
        }
      }
    }

    return { success: true };
  }
}
