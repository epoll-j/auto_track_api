import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

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
