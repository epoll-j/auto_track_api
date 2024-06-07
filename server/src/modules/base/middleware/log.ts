import { Middleware } from '@midwayjs/decorator';
import * as _ from 'lodash';
import { NextFunction, Context } from '@midwayjs/koa';
import { Config, IMiddleware } from '@midwayjs/core';
import { BaseSysLogService } from '../service/sys/log';

/**
 * 日志中间件
 */
@Middleware()
export class BaseLogMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('koa.globalPrefix')
  prefix;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const baseSysLogService = await ctx.requestContext.getAsync(
        BaseSysLogService
      );
      let deviceId = '';
      let userType = -1;
      let userId: any = null;
      if (ctx.admin) {
        userType = 0;
        userId = ctx.admin.userId;
      } else if (ctx.user) {
        userType = 1;
        userId = ctx.user.user_id;
        deviceId = ctx.deviceId || '';
      } else {
        let { url } = ctx;
        url = url.replace(this.prefix, '').split('?')[0];
        if (_.startsWith(url, '/api/track')) {
          userType = 2;
          const body: any = ctx.request.body;
          if (body) {
            deviceId = body.device_id || '';
            userId = body.user_id || null;
          }
        }
      }

      baseSysLogService.record(
        ctx,
        ctx.url,
        ctx.req.method === 'GET' ? ctx.request.query : ctx.request.body,
        userId,
        userType,
        deviceId
      );
      await next();
    };
  }
}
