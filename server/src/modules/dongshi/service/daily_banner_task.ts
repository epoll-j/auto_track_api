import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { DailyBanner } from '../entity/daily_banner';
import { Banner } from '../entity/banner';
import { Book } from '../entity/book';
import { ApnsService } from './apns';

/**
 * 描述
 */
@Provide()
export class DailyBannerTaskService extends BaseService {
  @InjectEntityModel(DailyBanner)
  dailyBannerRepo: Repository<DailyBanner>;
  @InjectEntityModel(Banner)
  bannerRepo: Repository<Banner>;
  @InjectEntityModel(Book)
  bookRepo: Repository<Book>;
  @Inject()
  apnsService: ApnsService;

  async updateBanner() {
    const dailyList = await this.dailyBannerRepo.find({
      where: { finish: 0 },
      order: {
        sort_by: 'DESC',
        id: 'ASC',
      },
      take: 1,
    });
    if (dailyList.length <= 0) {
      return '暂无替换列表';
    }
    const dailyBanner = dailyList[0];
    const book = await this.bookRepo.findOneBy({ id: dailyBanner.book_id });
    const banner = new Banner();
    banner.param = {
      type: 2,
      book_id: book.id,
    };
    banner.img_url = `http://cdn.iflow.mobi/jianshu/banner_cover/${book.title}.png`;
    if (book) {
      await this.bannerRepo.update({ id: 1 }, banner);
      dailyBanner.finish = 1;
      return `免费书籍替换为【${book.title} - ${book.id}】`;
    }
  }

  async sendApns() {
    const dailyList = await this.dailyBannerRepo.find({
      where: { finish: 0 },
      order: {
        sort_by: 'DESC',
        id: 'ASC',
      },
      take: 1,
    });
    if (dailyList.length <= 0) {
      return '暂无替换列表';
    }
    const dailyBanner = dailyList[0];
    await this.apnsService.sendAll({
      alert: {
        body: dailyBanner.apns_body,
        title: dailyBanner.apns_title,
        subTitle: '',
      },
      category: 'mutable',
      attachmentUrl: '',
      mutableContent: true,
    });
    await this.dailyBannerRepo.update({ id: dailyBanner.id }, { finish: 1 });
    return `发送每日推荐更新推送【${dailyBanner.apns_title} - ${dailyBanner.apns_body}】`;
  }
}
