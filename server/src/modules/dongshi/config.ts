import { ModuleConfig } from '@cool-midway/core';
import { AuthMiddleware } from './middleware/auth';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '洞识APP',
    // 模块描述
    description: 'api服务',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [AuthMiddleware],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    sms: {
      // 验证码有效期，单位秒
      timeout: 60 * 3,
    },
    // jwt
    jwt: {
      // token 过期时间，单位秒
      expire: 60 * 60 * 24,
      // 刷新token 过期时间，单位秒
      refreshExpire: 60 * 60 * 24 * 30,
      // jwt 秘钥
      secret: 'ada45a701a5011efa67f23cd587ea836',
    },
    iap: {},
  } as ModuleConfig;
};
