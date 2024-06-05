import { Post, Inject, Provide, Get, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../../service/user';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';

@Provide()
@CoolController('/api/user')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Post('/login')
  async login(@Body() body: { phone: string; code: string }) {
    const result = await this.userService.loginByPhone(body.phone, body.code);
    return this._handlerServiceRes(result);
  }

  @Post('/register')
  async register() {
    const result = await this.userService.register();
    return this._handlerServiceRes(result);
  }

  @Post('/bindPhone')
  async bindPhone(@Body() body: { phone: string; code: string }) {
    const { user } = this.ctx;
    if (!user) {
      return this.auth('请重新登录');
    }
    const result = await this.userService.bindPhone(
      body.phone,
      body.code,
      user.user_id
    );
    return this._handlerServiceRes(result);
  }

  @Get('/info')
  async userInfo() {
    const result = await this.userService.getInfo();
    return this._handlerServiceRes(result);
  }

  @Post('/closeAccount')
  async closeAccount() {
    const result = await this.userService.closeAccount();
    return this._handlerServiceRes(result);
  }

  @Post('/apnsToken')
  async apnsToken(@Body() body: { token: string }) {
    const result = await this.userService.updateApnsToken(body.token);
    return this._handlerServiceRes(result);
  }

  _handlerServiceRes(res: { code: number; msg?: string; data?: any }) {
    if (res.code === 1) {
      return this.ok(res.data);
    } else {
      return { ...this.fail(res.msg, res.code), msg: res.msg };
    }
  }
}
