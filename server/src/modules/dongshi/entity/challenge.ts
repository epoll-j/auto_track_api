import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    UpdateDateColumn,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity('challenge', { database: 'ds' })
  export class Challenge {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
    id: number;
  
    @Column('varchar', { name: 'title', length: 256 })
    title: string;
  
    @Column('varchar', { name: 'cover', length: 1024 })
    cover: string;

    @Column('varchar', { name: 'icon', length: 1024 })
    icon: string;
  
    @Column('varchar', { name: 'color', length: 256 })
    color: string;
  
    @Column('json', { name: 'book_ids' })
    book_ids: number[];
  
    @Column('json', { name: 'trophy_imgs' })
    trophy_imgs: string[];
  
    @Column('json', { name: 'boost' })
    boost: string[];
  
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
  