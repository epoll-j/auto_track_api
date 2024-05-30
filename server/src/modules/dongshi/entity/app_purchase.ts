import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity('app_purchase', { database: 'ds' })
export class AppPurchase {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'user_id', length: 32 })
  user_id: string;

  @Column('varchar', { name: 'transaction_id', length: 50 })
  transaction_id: string;

  @Column('varchar', { name: 'original_transaction_id', length: 50 })
  original_transaction_id: string;

  @Column('varchar', { name: 'web_order_line_item_id', length: 50 })
  web_order_line_item_id: string;

  @Column('varchar', { name: 'bundle_id', length: 30 })
  bundle_id: string;

  @Column('varchar', { name: 'product_id', length: 30 })
  product_id: string;

  @Column('varchar', { name: 'subscription_group_identifier', length: 30 })
  subscription_group_identifier: string;

  @Column('datetime', { name: 'purchase_date' })
  purchase_date: Date;

  @Column('datetime', { name: 'original_purchase_date' })
  original_purchase_date: Date;

  @Column('datetime', { name: 'expires_date' })
  expires_date: Date;

  @Column('int', { name: 'purchase_quantity' })
  purchase_quantity: number;

  @Column('varchar', { name: 'purchase_type', length: 100 })
  purchase_type: string;

  @Column('varchar', { name: 'in_app_ownership_type', length: 100 })
  in_app_ownership_type: string;

  @Column('datetime', { name: 'signed_date' })
  signed_date: Date;

  @Column('varchar', { name: 'transaction_reason', length: 20 })
  transaction_reason: string;

  @Column('varchar', { name: 'storefront', length: 20 })
  storefront: string;

  @Column('varchar', { name: 'storefront_id', length: 20 })
  storefront_id: string;

  @Column('varchar', { name: 'purchase_environment', length: 20 })
  purchase_environment: string;

  @Column('int', { name: 'purchase_price' })
  purchase_price: number;

  @Column('varchar', { name: 'purchase_currency', length: 50 })
  purchase_currency: string;

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
