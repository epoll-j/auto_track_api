import {
  Column,
  Index,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Index(
  'unique_track',
  ['user_id', 'content_id', 'content_type', 'track_type', 'device_id'],
  { unique: true }
)
@Entity('track', { database: 'ds' })
export class Track {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'content_id', length: 50 })
  content_id: string;

  @Column('varchar', { name: 'user_id', length: 50 })
  user_id: string;

  @Column('int', { name: 'content_type' })
  content_type: number;

  @Column('int', { name: 'track_type' })
  track_type: number;

  @Column('varchar', { name: 'device_id', nullable: true, length: 255 })
  device_id: string | null;

  @Column('json', { name: 'param', nullable: true })
  param: any;

  @Column('json', { name: 'last_param', nullable: true })
  last_param: any;

  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', nullable: true })
  update_time: Date;

}
