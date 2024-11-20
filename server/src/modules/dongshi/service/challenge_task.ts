import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { Between, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Book } from '../entity/book';
import { ApnsService } from './apns';
import { UserChallenge } from '../entity/user_challenge';
import * as _ from 'lodash';
import { Challenge } from '../entity/challenge';

@Provide()
export class ChallengeTaskService extends BaseService {
  @InjectEntityModel(Book)
  bookRepo: Repository<Book>;
  @InjectEntityModel(UserChallenge)
  userChallengeRepo: Repository<UserChallenge>;
  @InjectEntityModel(Challenge)
  challengeRepo: Repository<Challenge>;
  @Inject()
  apnsService: ApnsService;

  async dailyPush() {
    const dailyList = await this.userChallengeRepo.find({
      where: {
        daily_finish: 0,
        status: LessThanOrEqual(0),
        update_time: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date()
        ),
      },
    });
    const challengeMap: { [key: string]: Challenge } = {};
    const bookMap: { [key: string]: Book } = {};
    for (const item of dailyList) {
      const id = item.challenge_id;
      if (!challengeMap[id]) {
        challengeMap[id] = await this.challengeRepo.findOneBy({ id });
      }
    }

    for (const item of Object.values(challengeMap)) {
      for (const id of item.book_ids) {
        if (!bookMap[id]) {
          bookMap[id] = await this.bookRepo.findOneBy({ id });
        }
      }
    }

    const groupMap = _.groupBy(dailyList, 'user_id');
    const apnsMap: { [key: string]: any } = {};
    for (const userId in groupMap) {
      const list: UserChallenge[] = groupMap[userId];
      let title = '';
      let body = '';
      if (list.length > 0) {
        if (list.length === 1) {
          const progress = list[0];
          const challenge = challengeMap[progress.challenge_id];
          const index = progress.challenge_progress.findIndex(p => p < 1);
          const book = bookMap[challenge.book_ids[index]];
          title = `🔥开启${challenge.title}挑战的Day${index + 1}!`;
          body = `今天的阅读《${book.title}》${book.effect}，点击进入，完成知识挑战！`;
        } else {
          title = '🔥今日阅读挑战来了!';
          for (let i = 0; i < 2; i++) {
            const progress = list[i];
            const challenge = challengeMap[progress.challenge_id];
            const index = progress.challenge_progress.findIndex(p => p < 1);
            const book = bookMap[challenge.book_ids[index]];
            body += `${challenge.title}Day ${index + 1}: ${
              i === 0 ? '阅读' : '探索'
            }《${book.title}》${i === 0 ? '\n' : ''}`;
          }
        }
      }
      apnsMap[userId] = {
        alert: {
          body: body,
          title: title,
          subTitle: '',
        },
      };
    }

    await this.apnsService.sendByMap(apnsMap);

    return '每天进行中挑战推送发送成功';
  }

  async dailyNoFinishPush() {
    const dailyList = await this.userChallengeRepo.find({
      where: {
        daily_finish: 0,
        status: LessThanOrEqual(0),
        update_time: Between(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
          new Date()
        ),
      },
    });
    const challengeMap: { [key: string]: Challenge } = {};
    for (const item of dailyList) {
      const id = item.challenge_id;
      if (!challengeMap[id]) {
        challengeMap[id] = await this.challengeRepo.findOneBy({ id });
      }
    }
    const groupMap = _.groupBy(dailyList, 'user_id');
    const apnsMap: { [key: string]: any } = {};
    for (const userId in groupMap) {
      const list: UserChallenge[] = groupMap[userId];
      if (list.length > 0) {
        const progress = list[0];
        const challenge = challengeMap[progress.challenge_id];
        const index = progress.challenge_progress.findIndex(p => p < 1);
        apnsMap[userId] = {
          alert: {
            body: '只需几分钟，为今天的目标画上圆满句号！',
            title: `🌿${challenge.title}Day ${index + 1}还在等你！`,
            subTitle: '',
          },
        };
      }
    }
    await this.apnsService.sendByMap(apnsMap);

    return '每天未完成挑战推送发送成功';
  }

  async callBackPush() {
    for (let i = 0; i < 3; i++) {
      const callBackList = await this.userChallengeRepo.find({
        where: {
          daily_finish: 0,
          status: 0,
          update_time: LessThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
          call_back_count: i,
        },
      });

      const challengeMap: { [key: string]: Challenge } = {};
      const bookMap: { [key: string]: Book } = {};
      for (const item of callBackList) {
        const id = item.challenge_id;
        if (!challengeMap[id]) {
          challengeMap[id] = await this.challengeRepo.findOneBy({ id });
        }
      }

      for (const item of Object.values(challengeMap)) {
        for (const id of item.book_ids) {
          if (!bookMap[id]) {
            bookMap[id] = await this.bookRepo.findOneBy({ id });
          }
        }
      }

      const groupMap = _.groupBy(callBackList, 'user_id');
      const apnsMap: { [key: string]: any } = {};
      for (const userId in groupMap) {
        const list: UserChallenge[] = groupMap[userId];
        if (list.length > 0) {
          for (const item of list) {
            item.call_back_count = i + 1;
            await this.userChallengeRepo.save(item);
          }
          const progress = list[0];
          const challenge = challengeMap[progress.challenge_id];
          const index = progress.challenge_progress.findIndex(p => p < 1);
          const book = bookMap[challenge.book_ids[index]];
          let title = '';
          let body = '';
          if (i === 0) {
            title = '🤔咦？你是不是忘了什么？';
            body = `今天的《${book.title}》只需要${book.reading_time}分钟就能看完，真的不难哦~`;
          } else if (i === 1) {
            title = '😮‍💨这本书好像在偷偷叹气～';
            body = `Day ${index + 1} 的《${book.title}》${
              book.effect
            }，别让它白等了，快来看看吧！只需${
              book.reading_time
            }分钟，马上补上，你会发现自己更棒！`;
          } else {
            title = '🙁 再不回来，它就要被记忆封印了！';
            body = `还记得${challenge.title}的 Day ${index + 1} 吗？《${
              book.title
            }》正在等你解锁，你只需要花几分钟就能搞定！  \n别让它孤单，完成它，你会发现自己超厉害！`;
          }
          apnsMap[userId] = {
            alert: {
              body: body,
              title: title,
              subTitle: '',
            },
          };
        }
      }

      await this.apnsService.sendByMap(apnsMap);
    }
    return '挑战召回推送发送成功';
  }
}
