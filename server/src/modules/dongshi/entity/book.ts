import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('book', { database: 'ds' })
export class Book {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', length: 200 })
  title: string;

  @Column('varchar', { name: 'sub_title', nullable: true, length: 200 })
  sub_title: string | null;

  @Column('int', { name: 'reading_time', default: () => "'0'" })
  reading_time: number;

  @Column('json', { name: 'tags' })
  tags: any;

  @Column('varchar', { name: 'book_desc', length: 2048 })
  book_desc: string;

  @Column('varchar', { name: 'inside', length: 2048 })
  inside: string;

  @Column('varchar', { name: 'cover', length: 2048 })
  cover: string;

  @Column('varchar', { name: 'author', nullable: true, length: 1024 })
  author: string | null;

  @Column('varchar', { name: 'about_author', length: 2048 })
  about_author: string;

  @Column('varchar', { name: 'second_author', nullable: true, length: 1024 })
  second_author: string | null;

  @Column('varchar', { name: 'learn', length: 2048 })
  learn: string;

  @Column('int', { name: 'sort_by', default: () => "'1'" })
  sort_by: number;

  @Column('int', { name: 'is_free', default: () => "'0'" })
  is_free: number;

  @Column('int', { name: 'book_status', default: () => "'1'" })
  book_status: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createTime',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', nullable: true })
  update_time: Date;
}
