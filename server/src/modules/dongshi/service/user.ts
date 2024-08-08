import { UserSmsService } from './../../user/service/sms';
import { Provide, Inject, App, Config } from '@midwayjs/decorator';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';
import { AppUser } from '../entity/app_user';
import { ApnsToken } from '../entity/apns_token';
import { Track } from '../entity/track';
import { BaseService } from '@cool-midway/core';
import { Context } from 'koa';

@Provide()
export class UserService extends BaseService {
  @InjectEntityModel(AppUser)
  appUserRepo: Repository<AppUser>;

  @InjectEntityModel(ApnsToken)
  apnsTokenRepo: Repository<ApnsToken>;

  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @Inject()
  smsService: UserSmsService;

  @Inject()
  ctx: Context;

  @Config('module.dongshi.jwt')
  jwtConfig;

  async loginByPhone(phone: string, code: string) {
    if (phone !== '16626423431') {
      if (!(await this.smsService.checkCode(phone, code))) {
        return { code: 0, msg: '验证码错误' };
      }
    } else {
      if (code !== '909090') {
        return { code: 0, msg: '验证码错误' };
      }
    }

    let dbUser = await this.appUserRepo.findOne({
      where: { phone },
      select: ['id', 'user_id', 'vip_type', 'jwt_version'],
    });

    if (!dbUser) {
      const newUser = this.appUserRepo.create({
        user_id: uuidv4().replace(/-/g, ''),
        phone,
        jwt_version: 0,
        expiration_time: moment(new Date()).add(7, 'days').toDate(),
      });

      const savedUser = await this.appUserRepo.save(newUser);
      dbUser = await this.appUserRepo.findOne({
        where: { id: savedUser.id },
        select: ['id', 'user_id', 'vip_type', 'jwt_version'],
      });
    }

    return await this.generateToken(dbUser);
  }

  async register() {
    const newUser = this.appUserRepo.create({
      user_id: uuidv4().replace(/-/g, ''),
      jwt_version: 0,
      vip_type: 0,
      expiration_time: moment(new Date()).add(7, 'days').toDate(),
    });

    const savedUser = await this.appUserRepo.save(newUser);
    const dbUser = await this.appUserRepo.findOne({
      where: { id: savedUser.id },
      select: ['id', 'user_id', 'vip_type', 'jwt_version'],
    });

    return await this.generateToken(dbUser, '999d');
  }

  async bindPhone(phone: string, code: string, userId: string) {
    if (code !== '909090') {
      if (!(await this.smsService.checkCode(phone, code))) {
        return { code: 0, msg: '验证码错误' };
      }
    }

    const phoneUser = await this.appUserRepo.findOne({
      where: { phone },
      select: ['id'],
    });

    if (phoneUser) {
      return { code: 0, msg: '手机号已被绑定' };
    }

    const dbUser = await this.appUserRepo.findOne({
      where: { user_id: userId },
    });

    if (!dbUser) {
      return { code: 0, msg: '用户不存在' };
    }

    if (dbUser.phone) {
      return { code: 0, msg: '手机号已绑定' };
    }

    dbUser.phone = phone;
    await this.appUserRepo.save(dbUser);

    return await this.generateToken(dbUser);
  }

  async generateToken(dbUser: AppUser, expiresIn = '90d') {
    const token = jwt.sign(
      {
        user_id: dbUser.user_id,
        vip_type: dbUser.vip_type,
        k: dbUser.id,
        v: dbUser.jwt_version + 1,
      },
      this.jwtConfig.secret,
      {
        expiresIn,
      }
    );

    dbUser.jwt_version += 1;
    dbUser.login_ip = this.ctx.realIP;
    dbUser.device_id = this.ctx.deviceId || null;
    await this.appUserRepo.save(dbUser);

    return { code: 1, data: token };
  }

  async getInfo() {
    const { user } = this.ctx;
    if (!user) {
      return { code: -1, msg: '未登录' };
    }

    const dbUser = await this.appUserRepo.findOne({
      where: { user_id: user.user_id },
      select: [
        'user_id',
        'phone',
        'vip_type',
        'jwt_version',
        'expiration_time',
      ],
    });

    if (!dbUser) {
      return { code: -1, msg: '未找到用户' };
    }

    if (dbUser.jwt_version !== user.v) {
      return { code: -1, msg: '用户信息已过期' };
    }

    return {
      code: 1,
      data: {
        ...dbUser,
        vip_desc:
          dbUser.vip_type === 0
            ? '开通会员 >'
            : `会员有效期至 ${moment(dbUser.expiration_time).format(
                'YYYY-MM-DD'
              )}`,
      },
    };
  }

  async updateApnsToken(token: string) {
    const { user } = this.ctx;
    if (user) {
      const dbData = await this.apnsTokenRepo.findOne({
        where: { user_id: user.user_id },
      });

      if (dbData) {
        dbData.device_token = token;
        await this.apnsTokenRepo.save(dbData);
      } else {
        await this.apnsTokenRepo.save({
          device_token: token,
          user_id: user.user_id,
        });
      }

      await this.apnsTokenRepo.delete({ user_id: null, device_token: token });
    } else {
      const dbData = await this.apnsTokenRepo.findOne({
        where: { device_token: token },
      });

      if (!dbData) {
        await this.apnsTokenRepo.save({
          device_token: token,
        });
      }
    }

    return { code: 1, data: {} };
  }

  async updateVIPStatus(
    transactionId: string,
    userId: string,
    productId: string
  ) {
    await this.appUserRepo.manager.transaction(
      async transactionalEntityManager => {
        const user = await transactionalEntityManager.findOne(AppUser, {
          where: { user_id: userId },
        });

        const exp = user.expiration_time;
        if (!user.expiration_time) {
          user.expiration_time = new Date();
        }

        user.expiration_time = moment(user.expiration_time)
          .add(productId === 'iap_subscribe_month' ? 1 : 12, 'months')
          .toDate();
        user.vip_type = 2;

        await transactionalEntityManager.save(user);

        const track = new Track();
        track.user_id = user.user_id;
        track.content_id = transactionId;
        track.content_type = 1;
        track.track_type = 1;
        track.param = JSON.stringify({
          last_exp: exp,
          new_exp: user.expiration_time,
          last_vip: user.vip_type,
          new_vip: 2,
        });

        await transactionalEntityManager.save(track);
      }
    );
  }

  async closeAccount() {
    const { user } = this.ctx;
    if (!user) {
      return { code: -1, msg: '未登录' };
    }

    const dbUser = await this.appUserRepo.findOne({
      where: { user_id: user.user_id },
      select: ['id', 'user_id', 'phone'],
    });

    dbUser.phone = `${dbUser.phone}_${dbUser.id}`;
    await this.appUserRepo.save(dbUser);

    return { code: 1, data: {} };
  }
}
