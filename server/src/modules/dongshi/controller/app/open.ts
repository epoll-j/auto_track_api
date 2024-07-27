import { BaseSysParamService } from './../../../base/service/sys/param';
import { UserSmsService } from './../../../user/service/sms';
import { Inject, Provide, Get, Query, Body, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { ApnsService } from '../../service/apns';

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
    return this.ok(await this.baseSysParamService.dataByKey('ds_config'));
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
