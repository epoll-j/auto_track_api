import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('iap_notification', { database: 'ds' })
export class IapNotification {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: string;

  @Column('text', { name: 'jwt_text' })
  jwt_text: string;

  @Column('longtext', { name: 'payload_data' })
  payload_data: string;

  @Column('datetime', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_time: Date;
}
