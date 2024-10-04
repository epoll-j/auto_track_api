import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Context } from '@midwayjs/koa';
import { BaseService } from '@cool-midway/core';
import { Banner } from '../entity/banner';

@Provide()
export class BannerService extends BaseService {
  @InjectEntityModel(Banner)
  bannerRepo: Repository<Banner>;

  @Inject()
  ctx: Context;

  async getList() {
    return await this.bannerRepo.find({
      where: {
        banner_status: 1,
      },
      select: ['id', 'img_url', 'jump_type', 'param'],
      order: {
        sort_by: 'DESC',
      },
    });
  }
}
