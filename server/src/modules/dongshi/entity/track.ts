import {
  Column,
  Index,
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { AppUser } from './app_user';

@Index(
  'unique_track',
  ['user', 'content_id', 'content_type', 'track_type', 'device_id'],
  { unique: true }
)
@Entity('track', { database: 'ds' })
export class Track {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

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

  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  update_time: Date;

  @ManyToOne(() => AppUser, user => user.tracks)
  @JoinColumn({ name: 'user_id' })
  user: AppUser;
}
