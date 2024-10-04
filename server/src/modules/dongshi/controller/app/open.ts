import { BaseSysParamService } from './../../../base/service/sys/param';
import { UserSmsService } from './../../../user/service/sms';
import { Inject, Provide, Get, Query, Body, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { ApnsService } from '../../service/apns';
import * as crypto from 'crypto';
import * as _ from 'lodash';

@Provide()
@CoolController('/api/open')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  baseSysParamService: BaseSysParamService;
  @Inject()
  userSmsService: UserSmsService;
  @Inject()
  apnsService: ApnsService;

  @Get('/config')
  async getConfig() {
    const basic = await this.baseSysParamService.dataByKey('ds_config');
    let mergeConfig = {};
    if (this.ctx.deviceId) {
      const groupIndex = this.getABGroup(this.ctx.deviceId, 3);
      if (groupIndex !== 0) {
        mergeConfig = await this.baseSysParamService.dataByKey(
          `ds_config_${groupIndex}`
        );
      }
    }
    return this.ok(_.merge(basic, mergeConfig));
  }

  getABGroup(deviceId, numGroups) {
    const hash = crypto.createHash('sha256').update(deviceId).digest('hex');
    const groupIndex = parseInt(hash, 16) % numGroups;
    return groupIndex; // 返回组索引（0 到 n-1）
  }

  @Get('/sms')
  async getSms(@Query('phone') phone: string) {
    await this.userSmsService.sendSms(phone, {
      template: 'SMS_465346354',
      signName: '洞识APP',
    });
    return this.ok();
  }

  @Post('/apns')
  async sendApns(@Body() body) {
    const { userId, data } = body;
    if (Array.isArray(userId)) {
      for (const id of userId) {
        await this.apnsService.send(id, data);
      }
    } else {
      await this.apnsService.send(userId, data);
    }
    return this.ok();
  }
}
