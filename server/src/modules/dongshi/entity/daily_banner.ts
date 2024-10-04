import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('daily_banner', { database: 'ds' })
export class DailyBanner {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'book_id' })
  book_id: number;

  @Column('varchar', { name: 'apns_title', length: 255 })
  apns_title: string;

  @Column('varchar', { name: 'apns_body', length: 255 })
  apns_body: string;

  @Column('int', { name: 'sort_by', default: () => "'1'" })
  sort_by: number;

  @Column('int', { name: 'finish', default: () => "'1'" })
  finish: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createTime',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', nullable: true })
  update_time: Date;
}
