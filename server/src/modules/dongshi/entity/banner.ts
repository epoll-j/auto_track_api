import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('banner', { database: 'ds' })
export class Banner {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('longtext', { name: 'tags', nullable: true })
  tags: string | null;

  @Column('varchar', { name: 'img_url', length: 1024 })
  img_url: string;

  @Column('int', { name: 'jump_type' })
  jump_type: number;

  @Column('int', { name: 'banner_status', default: () => "'1'" })
  banner_status: number;

  @Column('longtext', { name: 'param' })
  param: string;

  @Column('int', { name: 'sort_by', default: () => "'1'" })
  sort_by: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  update_time: Date;
}
