import { BaseEntity } from '@cool-midway/core';
import { Column, Index, Entity } from 'typeorm';

/**
 * 系统日志
 */
@Entity('base_sys_log')
export class BaseSysLogEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', nullable: true })
  userId: string;

  @Index()
  @Column({ comment: '用户类型', nullable: true })
  userType: number;

  @Index()
  @Column({ comment: '设备ID', nullable: true })
  deviceId: string;

  @Index()
  @Column({ comment: '行为' })
  action: string;

  @Index()
  @Column({ comment: 'ip', nullable: true })
  ip: string;

  @Index()
  @Column({ comment: 'ip地址', nullable: true, length: 50 })
  ipAddr: string;

  @Column({ comment: '参数', nullable: true, type: 'json' })
  params: string;
}
