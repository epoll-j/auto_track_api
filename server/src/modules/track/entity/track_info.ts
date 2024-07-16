import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Index('app_key', ['appKey'], {})
@Index('user_id', ['userId'], {})
@Index('track_id', ['trackId'], {})
@Entity('track_info', { database: 'track' })
export class TrackInfo {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'app_key', length: 200 })
  appKey: string;

  @Column('varchar', { name: 'unique_id', nullable: true, length: 255 })
  uniqueId: string;

  @Column('varchar', { name: 'device_id', length: 255 })
  deviceId: string;

  @Column('varchar', { name: 'user_id', nullable: true, length: 200 })
  userId: string | null;

  @Column('varchar', { name: 'track_id', length: 200 })
  trackId: string;

  @Column('varchar', { name: 'track_type', length: 200 })
  trackType: string;

  @Column('varchar', { name: 'track_key', length: 200 })
  trackKey: string;

  @Column('varchar', { name: 'track_ip', length: 200 })
  trackIp: string;

  @Column('varchar', { name: 'track_ip_addr', length: 300 })
  trackIpAddr: string;

  @Column('varchar', { name: 'app_version', length: 200 })
  appVersion: string;

  @Column('datetime', { name: 'track_time' })
  trackTime: Date;

  @Column('longtext', { name: 'track_params' })
  trackParams: string;

  @Column('datetime', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createTime: Date;
}
