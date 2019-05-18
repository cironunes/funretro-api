import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity
} from "typeorm";

import { Card } from "./Card";
import { User } from "./User";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(type => User, user => user.comments)
  author: User;

  @ManyToOne(type => Card, card => card.comments)
  card: Card;
}
