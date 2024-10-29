import { Inject, Provide, Get, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { CoolController } from '@cool-midway/core';
import BaseController from '../base_controller';
import { ChallengeService } from '../../service/challenge';

@Provide()
@CoolController('/api')
export class ChallengeController extends BaseController {
  @Inject()
  ctx: Context;
  @Inject()
  challengeService: ChallengeService;

  @Get('/challenge/list')
  async getChallengeList(
    @Query('page') page?: number,
    @Query('size') size?: number
  ) {
    return this.ok(await this.challengeService.getList(page || 1, size || 5));
  }

  @Get('/challenge/info')
  async getChallengeInfo(@Query('id') id: number) {
    return this.ok(await this.challengeService.getChallengeInfo(id));
  }

  @Get('/challenge/progress')
  async getChallengeProgress() {
    return this.ok(await this.challengeService.getChallengeProgress());
  }
}
