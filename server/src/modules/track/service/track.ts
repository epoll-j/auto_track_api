import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import * as _ from 'lodash';

import { AppInfoService } from './app';
import { TrackDTO } from '../dto/track';
import { TrackInfo } from '../entity/track_info';
import { Context } from '@midwayjs/koa';
import { Utils } from '../../../comm/utils';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { RedisService } from '@midwayjs/redis';
import { TrackUser } from '../entity/track_user';

@Provide()
export class TrackService extends BaseService {
  @Inject()
  ctx: Context;
  @Inject()
  utils: Utils;
  @Inject()
  appService: AppInfoService;
  @Inject()
  redis: RedisService;
  @InjectEntityModel(TrackInfo)
  trackInfoEntity: Repository<TrackInfo>;
  @InjectEntityModel(TrackUser)
  trackUserEntity: Repository<TrackUser>;

  async add(body: TrackDTO) {
    const {
      app_key,
      user_id,
      track_id,
      data_list,
      device_info,
      app_version,
      unique_id,
      device_id,
    } = body;
    const rows: TrackInfo[] = [];
    let ip = await this.utils.getReqIP(this.ctx);
    ip = typeof ip === 'string' ? ip : ip.join(',');
    const ipAddrArr = [];
    for (const e of ip.split(','))
      ipAddrArr.push(await this.utils.getIpAddr(this.ctx, e));
    for (const data of data_list) {
      const userTrack = new TrackInfo();
      userTrack.appKey = app_key;
      userTrack.userId = user_id;
      userTrack.trackId = track_id;
      userTrack.trackTime = new Date(data.time);
      userTrack.trackType = data.type;
      userTrack.trackKey = data.key;
      userTrack.trackParams = JSON.stringify(data.params);
      userTrack.trackIp = ip;
      userTrack.appVersion = app_version;
      userTrack.deviceId = device_id;
      userTrack.uniqueId = unique_id;
      userTrack.trackIpAddr = ipAddrArr.join(',');

      rows.push(userTrack);
    }
    await this.trackInfoEntity.insert(rows);

    let userId = null;
    if (user_id && user_id !== '') {
      let user = await this.appService.getUser(app_key, user_id);

      if (!user) {
        const newUser = new TrackUser();
        newUser.appKey = app_key;
        newUser.userId = user_id;
        newUser.loginIp = ip;
        newUser.appVersion = app_version;
        newUser.deviceInfo = JSON.stringify(device_info);
        newUser.ipRegion = ipAddrArr.join(',');
        newUser.deviceId = device_id;
        newUser.uniqueId = unique_id;
        user = await this.trackUserEntity.save(newUser);
        const nuKey = `${app_key}:nu`;
        await this.redis.incr(nuKey);
      } else {
        if (
          new Date().getTime() - user.updateTime.getTime() >
          1000 * 60 * 60 * 12
        ) {
          user.appVersion = app_version;
          user.deviceInfo = JSON.stringify(device_info);
          user.loginIp = ip;
          user.ipRegion = ipAddrArr.join(',');

          await this.trackUserEntity.save(user);
        }
      }
      userId = user.id;
    }
    const dauKey = `${app_key}:dau`;
    if ((device_id && device_id !== '') || userId) {
      let dauId = userId;
      if (!dauId || dauId === '') {
        dauId = Number(
          BigInt(`0x${device_id.replace(/-/g, '')}`) % BigInt(1000000000)
        );
      }
      await this.redis.setbit(dauKey, dauId, 1);
    }

    return true;
  }
}
