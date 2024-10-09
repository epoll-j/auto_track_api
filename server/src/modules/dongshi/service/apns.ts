import { Config, Init, Inject, Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
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
      requestTimeout: 0, // optional, Default: 0 (without timeout)
      pingInterval: 5000, // optional, Default: 5000
    });
  }

  async send(userId, body) {
    if (!userId || !body) {
      return {
        code: 1,
      };
    }
    let param = userId;
    if (Array.isArray(userId)) {
      param = In(userId);
    }

    try {
      const token = await this.apnsTokenRepo.findBy({ user_id: param });
      const notifications = token.map(
        item => new Notification(item.device_token, body)
      );
      console.log(await this.apnsClient.sendMany(notifications));
    } catch (err) {
      console.log(err);
    }

    return { code: 1 };
  }

  async sendAll(body) {
    try {
      const token = await this.apnsTokenRepo.find({
        where: { user_id: Not(IsNull()) },
      });
      const uniqueTokens = [...new Set(token.map(item => item.device_token))];
      const notifications = uniqueTokens.map(
        item => new Notification(item, body)
      );
      console.log(await this.apnsClient.sendMany(notifications));
    } catch (err) {
      console.log(err);
    }
  }
}
