import { Config, Init, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { AppPurchase } from '../entity/app_purchase';
import { IapNotification } from '../entity/iap_notification';
import { Track } from '../entity/track';
import { UserService } from './user';
import {
  AppStoreServerAPIClient,
  Environment,
} from '@apple/app-store-server-library';

@Provide()
export class PurchaseService {
  @InjectEntityModel(AppPurchase)
  appPurchaseRepo: Repository<AppPurchase>;

  @InjectEntityModel(IapNotification)
  iapNotificationRepo: Repository<IapNotification>;

  @InjectEntityModel(Track)
  trackRepo: Repository<Track>;

  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Config('module.dongshi.iap')
  iapConfig;

  appStoreClient: AppStoreServerAPIClient;
  appStoreClientSandbox: AppStoreServerAPIClient;

  @Init()
  async init() {
    this.appStoreClient = new AppStoreServerAPIClient(
      this.iapConfig.privateKey,
      this.iapConfig.keyId,
      this.iapConfig.issuerId,
      this.iapConfig.bundleId,
      Environment.PRODUCTION
    );
    this.appStoreClientSandbox = new AppStoreServerAPIClient(
      this.iapConfig.privateKey,
      this.iapConfig.keyId,
      this.iapConfig.issuerId,
      this.iapConfig.bundleId,
      Environment.SANDBOX
    );
  }

  async handlerAppleNotification(payload) {
    const payloadData = this.getPayload(payload);
    const data = payloadData.data;
    if (data.status === 1) {
      const transcationInfo = this.getPayload(data.signedTransactionInfo);
      const originalTransactionId = transcationInfo.originalTransactionId;
      const transactionId = transcationInfo.transactionId;
      const originalPurchase = await this.appPurchaseRepo.findOne({
        where: {
          original_transaction_id: originalTransactionId,
        },
        select: ['user_id'],
      });
      if (originalPurchase != null) {
        await this.verifyPurchase(transactionId, originalPurchase.user_id);
      }
      await this.iapNotificationRepo.save({
        jwt_text: payload,
        payload_data: JSON.stringify(payloadData),
      });
      return 200;
    }
  }

  async verifyPurchase(transactionId, userId) {
    const purchase = await this.appPurchaseRepo.findOne({
      where: { transaction_id: transactionId },
    });
    if (purchase) {
      const track = await this.trackRepo.findOne({
        where: {
          content_id: transactionId,
          content_type: 1,
          track_type: 1,
        },
      });
      if (!track) {
        await this.userService.updateVIPStatus(
          transactionId,
          userId,
          purchase.product_id
        );
      }
      return {
        code: 1,
      };
    }

    let transactionInfo;
    try {
      transactionInfo = await this.appStoreClient.getTransactionInfo(
        transactionId
      );
    } catch (err) {
      transactionInfo = await this.appStoreClientSandbox.getTransactionInfo(
        transactionId
      );
    }
    if (transactionInfo && transactionInfo.signedTransactionInfo) {
      const payload = this.getPayload(transactionInfo.signedTransactionInfo);
      const oldPurchase = await this.appPurchaseRepo.findOne({
        where: {
          web_order_line_item_id: payload.webOrderLineItemId,
          purchase_type: payload.type,
          product_id: payload.productId,
          in_app_ownership_type: payload.inAppOwnershipType,
          user_id: userId,
          expires_date: new Date(payload.expiresDate),
          original_transaction_id: payload.originalTransactionId,
        },
      });
      const newPurchase = this.appPurchaseRepo.create({
        user_id: userId,
        transaction_id: payload.transactionId,
        original_transaction_id: payload.originalTransactionId,
        web_order_line_item_id: payload.webOrderLineItemId,
        bundle_id: payload.bundleId,
        product_id: payload.productId,
        subscription_group_identifier: payload.subscriptionGroupIdentifier,
        purchase_date: new Date(payload.purchaseDate),
        original_purchase_date: new Date(payload.originalPurchaseDate),
        expires_date: new Date(payload.expiresDate),
        purchase_quantity: payload.quantity,
        purchase_type: payload.type,
        in_app_ownership_type: payload.inAppOwnershipType,
        signed_date: new Date(payload.signedDate),
        transaction_reason: payload.transactionReason,
        storefront: payload.storefront,
        storefront_id: payload.storefrontId,
        purchase_environment: payload.environment,
        purchase_price: payload.price,
        purchase_currency: payload.currency,
      });
      await this.appPurchaseRepo.save(newPurchase);
      // 恢复购买
      if (!oldPurchase) {
        await this.userService.updateVIPStatus(
          transactionId,
          userId,
          payload.productId
        );
      }
      return {
        code: 1,
      };
    }
  }

  getPayload(jwt) {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
  }
}
