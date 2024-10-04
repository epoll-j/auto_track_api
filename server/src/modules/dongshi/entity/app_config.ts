import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
} from 'typeorm';

@Entity('app_config', { database: 'ds' })
export class AppConfig {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'config_type', unsigned: true, default: () => "'0'" })
  config_type: number;

  @Column('longtext', { name: 'config_body' })
  config_body: string;

  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
  })
  create_time: Date;
}
