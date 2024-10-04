import { BaseController } from '@cool-midway/core';

export default class Controller extends BaseController {
  ok(data?: any): { code: number; message: string; data: any } {
    return {
      code: 1,
      message: 'success',
      data,
    };
  }

  fail(
    message: string,
    code = 0
  ): { code: number; message: string; data: any } {
    return {
      code,
      message,
      data: null,
    };
  }

  auth(message: string): { code: number; message: string; data: any } {
    return {
      code: -1,
      message,
      data: null,
    };
  }
}
