import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('apns_click', { database: 'ds' })
export class ApnsClick {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'user_id', length: 255 })
  user_id: string;

  @Column('varchar', { name: 'device_id', length: 255 })
  device_id: string;

  @Column('longtext', { name: 'apns_content' })
  apns_content: string;

  @Column('datetime', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_time: Date;
}
