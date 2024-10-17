import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    UpdateDateColumn,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity('book_collection', { database: 'ds' })
  export class BookCollection {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
    id: number;
  
    @Column('varchar', { name: 'title', length: 256 })
    title: string;
  
    @Column('varchar', { name: 'cover', length: 256 })
    cover: string;
  
    @Column('varchar', { name: 'summary', length: 1024 })
    summary: string;
  
    @Column('varchar', { name: 'details', length: 2048 })
    details: string;
  
    @Column('json', { name: 'book_ids' })
    book_ids: string;
  
    @Column('int', { name: 'sort_by', default: () => "'1'" })
    sort_by: number;
  
    @Column('int', { name: 'status', default: () => "'1'" })
    status: number;
  
    @CreateDateColumn({
      type: 'datetime',
      name: 'createTime',
    })
    create_time: Date;
  
    @UpdateDateColumn({ type: 'datetime', name: 'updateTime', nullable: true })
    update_time: Date;
  }
  