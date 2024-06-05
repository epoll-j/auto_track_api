import { Column, PrimaryGeneratedColumn, Entity, Index } from 'typeorm';

@Index('user_id', ['userId'], { unique: true })
@Entity('track_user', { database: 'track' })
export class TrackUser {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'device_id', length: 255 })
  deviceId: string;

  @Column('varchar', { name: 'unique_id', length: 255 })
  uniqueId: string;

  @Column('varchar', { name: 'user_id', length: 255 })
  userId: string;

  @Column('varchar', { name: 'app_key', length: 255 })
  appKey: string;

  @Column('varchar', { name: 'login_ip', length: 50 })
  loginIp: string;

  @Column('varchar', { name: 'ip_region', length: 200 })
  ipRegion: string;

  @Column('varchar', { name: 'app_version', length: 50 })
  appVersion: string;

  @Column('longtext', { name: 'device_info' })
  deviceInfo: string;

  @Column('datetime', {
    name: 'create_time',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date | null;

  @Column('datetime', { name: 'update_time', nullable: true })
  updateTime: Date | null;
}
