import { Inject, Provide, Body, Post } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { PurchaseService } from '../../service/app_purchase';

@Provide()
@CoolController('/api/purchase')
export class PurchaseController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  purchaseService: PurchaseService;

  @Post('/notification/apple')
  async notificationByApple(@Body() body: any) {
    return this.ok(
      await this.purchaseService.handlerAppleNotification(body.signedPayload)
    );
  }

  @Post('/verify/iap')
  async getBanner(@Body() body: any) {
    const { transactionId } = body;
    const { user } = this.ctx;
    if (!user) {
      return this.auth('请先登录');
    }
    const { code } = await this.purchaseService.verifyPurchase(
      transactionId,
      user.user_id
    );
    if (code == 1) {
      return this.ok();
    }
    return this.fail('验证失败');
  }
}
