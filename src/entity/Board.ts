import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  BaseEntity
} from "typeorm";

import { Section } from "./Section";
import { User } from "./User";

@Entity()
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100
  })
  name: string;

  @Column("int")
  maxVotes: number;

  @OneToMany(type => Section, section => section.board)
  sections: Section[];

  @ManyToMany(() => User, user => user.boards)
  @JoinTable()
  users: User[];
}
