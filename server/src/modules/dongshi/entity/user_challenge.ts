import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_challenge', { database: 'ds' })
export class UserChallenge {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'user_id', length: 32 })
  user_id: string;

  @Column('int', { name: 'challenge_id' })
  challenge_id: number;

  @Column('json', { name: 'challenge_progress' })
  challenge_progress: number[];

  @Column('int', { name: 'daily_finish', default: () => "'0'" })
  daily_finish: number;

  @Column('int', { name: 'call_back_count', default: () => "'0'" })
  call_back_count: number;

  @Column('int', { name: 'status', default: () => "'-1'" })
  status: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createTime',
  })
  create_time: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updateTime', nullable: true })
  update_time: Date;
}
