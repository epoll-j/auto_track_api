import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { DailyBanner } from '../../entity/daily_banner';

/**
 * 每日推荐
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DailyBanner,
  pageQueryOp: {
    addOrderBy: {
      sort_by: 'desc',
      id: 'asc',
    },
    where: async ctx => {
      return [['finish =:finish', { finish: 0 }]];
    },
  },
})
export class DailyBannerController extends BaseController {}
