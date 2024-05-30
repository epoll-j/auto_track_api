import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Index(
  'unique_track',
  ['user_id', 'content_id', 'content_type', 'track_type', 'device_id'],
  { unique: true }
)
@Entity('track', { database: 'ds' })
export class Track {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'user_id', length: 32 })
  user_id: string;

  @Column('varchar', { name: 'content_id', length: 50 })
  content_id: string;

  @Column('int', { name: 'content_type' })
  content_type: number;

  @Column('int', { name: 'track_type' })
  track_type: number;

  @Column('varchar', { name: 'device_id', nullable: true, length: 255 })
  device_id: string | null;

  @Column('longtext', { name: 'param', nullable: true })
  param: string | null;

  @Column('longtext', { name: 'last_param', nullable: true })
  last_param: string | null;

  @Column('datetime', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_time: Date;

  @Column('datetime', {
    name: 'update_time',
    default: () => "'0000-00-00 00:00:00'",
  })
  update_time: Date;
}
