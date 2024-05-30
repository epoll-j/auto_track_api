import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

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
