import {
  Column,
  Index,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Index('user_id', ['user_id'], { unique: true })
@Entity('apns_token', { database: 'ds' })
export class ApnsToken {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'device_token', length: 255 })
  device_token: string;

  @Column('varchar', {
    name: 'user_id',
    nullable: true,
    unique: true,
    length: 32,
  })
  user_id: string | null;

  @Column('varchar', { name: 'last_user_id', nullable: true, length: 32 })
  last_user_id: string | null;

  @Column('int', { name: 'push_status', default: () => "'1'" })
  push_status: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', nullable: true })
  update_time: Date;
}
