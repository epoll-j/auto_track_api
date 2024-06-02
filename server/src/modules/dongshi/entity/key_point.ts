import {
  Column,
  Index,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Index('book_id', ['book_id'], {})
@Entity('key_point', { database: 'ds' })
export class KeyPoint {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'book_id', unsigned: true })
  book_id: number;

  @Column('int', { name: 'audio_time', default: () => "'0'" })
  audio_time: number;

  @Column('varchar', { name: 'audio_url', length: 2048 })
  audio_url: string;

  @Column('varchar', { name: 'title', length: 200 })
  title: string;

  @Column('longtext', { name: 'content' })
  content: string;

  @Column('int', { name: 'point_status', default: () => "'1'" })
  point_status: number;

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
