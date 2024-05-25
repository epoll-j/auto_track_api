import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity("track_statistics", { database: "track" })
export class TrackStatistics {
  @PrimaryGeneratedColumn({ type: "int", name: "id", unsigned: true })
  id: number;

  @Column("varchar", { name: "app_key", length: 255 })
  appKey: string;

  @Column("int", { name: "app_tu" })
  appTu: number;

  @Column("int", { name: "app_dau" })
  appDau: number;

  @Column("int", { name: "app_nu" })
  appNu: number;

  @Column("longtext", { name: "other_params", nullable: true })
  otherParams: string | null;

  @Column("datetime", {
    name: "data_time",
  })
  dataTime: Date;

  @Column("datetime", {
    name: "create_time",
    default: () => "CURRENT_TIMESTAMP",
  })
  createTime: Date;
}
