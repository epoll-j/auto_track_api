import { BaseSysParamService } from './../../../base/service/sys/param';
import { UserSmsService } from './../../../user/service/sms';
import { Inject, Provide, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';

@Provide()
@CoolController('/api/open')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  baseSysParamService: BaseSysParamService;
  @Inject()
  userSmsService: UserSmsService;

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
}
