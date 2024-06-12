import { UserSmsService } from './../../../user/service/sms';
import { Inject, Provide, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { DictInfoService } from '../../../dict/service/info';

@Provide()
@CoolController('/api/open')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  dictInfoService: DictInfoService;
  @Inject()
  userSmsService: UserSmsService;

  @Get('/config')
  async getConfig() {
    const config: any = await this.dictInfoService.data(['ds']);
    const result = {};
    for (const item of config.ds) {
      try {
        result[item.name] = JSON.parse(item.value);
      } catch {
        result[item.name] = item.value;
      }
    }
    return this.ok(result);
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
