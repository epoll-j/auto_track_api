import { Config, Init, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { ApnsClient, Host, Notification } from 'apns2';
import { ApnsToken } from '../entity/apns_token';

@Provide()
export class ApnsService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(ApnsToken)
  apnsTokenRepo: Repository<ApnsToken>;

  @Config('module.dongshi.apns')
  apnsConfig;

  apnsClient: ApnsClient;

  @Init()
  async init() {
    this.apnsClient = new ApnsClient({
      team: this.apnsConfig.team,
      keyId: this.apnsConfig.keyId,
      host: Host.production,
      signingKey: this.apnsConfig.key,
      defaultTopic: this.apnsConfig.defaultTopic,
      requestTimeout: 100, // optional, Default: 0 (without timeout)
      pingInterval: 5000, // optional, Default: 5000
    });
  }

  async send(userId, body) {
    if (!userId || !body) {
      return {
        code: 1,
      };
    }

    try {
      const token = await this.apnsTokenRepo.findBy({ user_id: userId });
      const notifications = token.map(
        item => new Notification(item.device_token, body)
      );
      await this.apnsClient.sendMany(notifications);
    } catch (err) {
      return err;
    }

    return { code: 1 };
  }
}
