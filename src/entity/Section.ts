import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  BaseEntity
} from "typeorm";

import { Card } from "./Card";
import { Board } from "./Board";

@Entity()
export class Section extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(type => Card, card => card.section)
  cards: Card[];

  @ManyToOne(type => Board, board => board.sections)
  board: Board;
}
