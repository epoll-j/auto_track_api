import { Config, IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { Context, NextFunction } from '@midwayjs/koa';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Middleware()
export class JwtMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('module.dongshi.jwt')
  jwtConfig;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const token = ctx.headers.authorization;
      if (token) {
        try {
          ctx.user = jwt.verify(token, this.jwtConfig.secret);
        } catch {
          ctx.body = {
            code: -1,
            msg: '授权验证失败',
          };
          return;
        }
      }
      const track = ctx.headers.track;
      if (track) {
        const [deviceId, signature] = (track as string).split(',');
        if (deviceId && signature) {
          const verifiedSignature = crypto
            .createHmac('sha256', '7f85a2ef-1f08-4c7b-828c-a27274bba12e')
            .update(`${deviceId}_iflow`)
            .digest('hex');
          if (verifiedSignature === signature) {
            ctx.deviceId = deviceId;
          }
        }
      }

      await next();
    };
  }
}
