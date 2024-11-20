import { BaseSysParamService } from './../../../base/service/sys/param';
import { UserSmsService } from './../../../user/service/sms';
import { Inject, Provide, Get, Query, Body, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { ApnsService } from '../../service/apns';
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
      const groupIndex = this.ctx.abGroup;
      if (groupIndex !== 0) {
        mergeConfig = await this.baseSysParamService.dataByKey(
          `ds_config_${groupIndex}`
        );
      }
    }
    // if (this.ctx.headers['app_version'] === '1.4.0') {
    //   return this.ok(
    //     _.merge(basic, {
    //       products: [
    //         {
    //           product_id: 'iap_subscribe_year_198',
    //           product_name: '年度订阅',
    //           product_price: '198',
    //           product_original_price: '298',
    //           discount_image: 'assets/images/discount-first-month.png',
    //           product_slogan: '2杯奶茶的价格',
    //         },
    //         {
    //           product_id: 'iap_subscribe_year_free',
    //           product_name: '年度订阅',
    //           product_price: '298',
    //           product_original_price: '',
    //           discount_image: 'assets/images/discount-most.png',
    //           product_slogan: '比月会员省86元',
    //         },
    //       ],
    //     })
    //   );
    // }
    return this.ok(_.merge(basic, mergeConfig));
  }

  @Get('/sms')
  async getSms(@Query('phone') phone: string) {
    if (phone === '16626423431') {
      return this.ok();
    }
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
