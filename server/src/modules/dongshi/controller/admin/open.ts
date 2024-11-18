import { Body, Config, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import axios from 'axios';

/**
 * 开放接口
 */
@Provide()
@CoolController()
export class BookController extends BaseController {
  @Config('module.dongshi.tyqw')
  apiKey: string;

  @Post('/gpt')
  async gpt(@Body() body: any) {
    const result = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/apps/3a154d2a0bb84923af0341df173fc1dc/completion',
      {
        input: {
          prompt: body.prompt,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
    return this.ok(result.data.output.text);
  }
}
