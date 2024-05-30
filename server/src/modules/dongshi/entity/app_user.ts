import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Index('user_id', ['user_id'], { unique: true })
@Entity('app_user', { database: 'ds' })
export class AppUser {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'user_id', unique: true, length: 32 })
  user_id: string;

  @Column('varchar', { name: 'phone', nullable: true, length: 20 })
  phone: string | null;

  @Column('int', { name: 'vip_type', default: () => "'1'" })
  vip_type: number;

  @Column('int', { name: 'jwt_version', nullable: true })
  jwt_version: number | null;

  @Column('datetime', { name: 'expiration_time', nullable: true })
  expiration_time: Date | null;

  @Column('varchar', { name: 'login_ip', nullable: true, length: 20 })
  login_ip: string | null;

  @Column('varchar', { name: 'device_id', nullable: true, length: 255 })
  device_id: string | null;

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
