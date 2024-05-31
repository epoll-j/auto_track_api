import { Post, Inject, Provide, Get, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { UserService } from '../../service/user';
import { BaseController, CoolController } from '@cool-midway/core';

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
    this.ctx.body = result;
  }

  @Post('/register')
  async register() {
    const result = await this.userService.register();
    this.ctx.body = result;
  }

  @Post('/bindPhone')
  async bindPhone(@Body() body: { phone: string; code: string }) {
    const { user } = this.ctx;
    if (!user) {
      this.ctx.body = {
        code: -1,
      };
      return;
    }
    const result = await this.userService.bindPhone(
      body.phone,
      body.code,
      user.user_id
    );
    this.ctx.body = result;
  }

  @Get('/info')
  async userInfo() {
    const result = await this.userService.getInfo();
    this.ctx.body = result;
  }

  @Post('/closeAccount')
  async closeAccount() {
    const result = await this.userService.closeAccount();
    this.ctx.body = result;
  }

  @Post('/apnsToken')
  async apnsToken(@Body() body: { token: string }) {
    const result = await this.userService.updateApnsToken(body.token);
    this.ctx.body = result;
  }
}
