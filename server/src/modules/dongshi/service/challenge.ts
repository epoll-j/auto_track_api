import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { BaseService } from '@cool-midway/core';

import { Challenge } from '../entity/challenge';
import { UserChallenge } from '../entity/user_challenge';
import { Book } from '../entity/book';
import { BookService } from './book';
import { Track } from '../entity/track';

@Provide()
export class ChallengeService extends BaseService {
  @InjectEntityModel(Challenge)
  challengeRepo: Repository<Challenge>;

  @InjectEntityModel(UserChallenge)
  userChallengeRepo: Repository<UserChallenge>;

  @InjectEntityModel(Book)
  bookRepo: Repository<Book>;

  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @Inject()
  bookService: BookService;

  @Inject()
  ctx: Context;

  async getList(page: number, size: number) {
    return await this.challengeRepo.find({
      where: {
        status: 1,
      },
      select: ['id', 'title', 'cover', 'color', 'icon'],
      order: {
        sort_by: 'DESC',
        id: 'DESC',
      },
      skip: (page - 1) * size,
      take: size,
    });
  }

  async getChallengeInfo(id: number) {
    const { user } = this.ctx;
    const challenge = await this.challengeRepo.findOne({
      where: {
        id,
      },
      select: [
        'id',
        'title',
        'color',
        'cover',
        'icon',
        'book_ids',
        'trophy_imgs',
        'boost',
      ],
    });

    if (!challenge) {
      return null;
    }

    const bookList = await this.bookService.getBookList(
      0,
      '',
      1,
      1,
      challenge.book_ids.map(Number)
    );

    const indexMap = {};
    challenge.book_ids.forEach((value, index) => {
      indexMap[Number(value)] = index;
    });
    bookList.sort((obj1, obj2) => {
      return indexMap[obj1.id] - indexMap[obj2.id];
    });

    if (!user) {
      return {
        ...challenge,
        book_list: bookList,
      };
    }

    let userChallenge = await this.userChallengeRepo.findOne({
      where: {
        user_id: user.user_id,
        challenge_id: id,
      },
      select: ['status', 'challenge_progress', 'daily_finish'],
    });

    if (!userChallenge) {
      userChallenge = new UserChallenge();
      userChallenge.user_id = user.user_id;
      userChallenge.challenge_id = id;
      const progress = [];
      userChallenge.challenge_progress = progress;
      for (const book of bookList) {
        const track = await this.trackRepo.findOneBy({
          user_id: user.user_id,
          content_type: 0,
          track_type: 0,
          content_id: book.id,
        });
        if (!track) {
          progress.push(0);
        } else {
          progress.push((track.param.index + 1) / book.key_point.length);
        }
      }
      if (progress[0] > 0) {
        userChallenge.status = 0;
      }
      await this.userChallengeRepo.save(userChallenge);
    }

    return {
      ...challenge,
      book_list: bookList,
      progress: userChallenge,
    };
  }

  async getChallengeProgress() {
    const { user } = this.ctx;
    if (!user || !user.user_id) {
      return [];
    }

    const userChallenge = await this.userChallengeRepo.find({
      where: {
        user_id: user.user_id,
        status: 0,
      },
      select: ['challenge_id', 'status', 'challenge_progress', 'daily_finish'],
    });

    if (!userChallenge || userChallenge.length === 0) {
      return [];
    }

    const challenge = await this.challengeRepo.find({
      where: {
        id: In(userChallenge.map(item => item.challenge_id)),
        status: 1,
      },
      select: ['id', 'title', 'icon', 'cover', 'color'],
    });

    const result = [];
    for (const item of userChallenge) {
      const index = challenge.findIndex(
        challengeItem => challengeItem.id === item.challenge_id
      );
      if (index !== -1) {
        result.push({
          ...challenge[index],
          progress: item,
        });
      }
    }

    return result;
  }
}
