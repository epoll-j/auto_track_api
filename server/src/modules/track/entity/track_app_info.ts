import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('app_info', { database: 'track' })
export class AppInfo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'app_name', length: 20 })
  appName: string;

  @Column('varchar', { name: 'app_key', length: 255 })
  appKey: string;

  @Column('varchar', { name: 'app_secret', length: 255 })
  appSecret: string;

  @Column('int', { name: 'app_status', default: () => "'1'" })
  appStatus: number;

  @Column('datetime', {
    name: 'create_time',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date | null;

  @Column('datetime', { name: 'update_time', nullable: true })
  updateTime: Date | null;
}
