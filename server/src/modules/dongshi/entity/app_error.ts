import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('app_error', { database: 'ds' })
export class AppError {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'device_id', length: 255 })
  device_id: string;

  @Column('longtext', { name: 'error_message' })
  error_message: string;

  @Column('datetime', {
    name: 'create_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_time: Date;
}
