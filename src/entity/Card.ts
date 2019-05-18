import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  BaseEntity
} from "typeorm";

import { Comment } from "./Comment";
import { User } from "./User";
import { Section } from "./Section";

@Entity()
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @OneToMany(type => Comment, comment => comment.card)
  comments: Comment[];

  @ManyToMany(type => User)
  @JoinTable()
  votes: User[];

  @ManyToOne(type => Section, section => section.cards)
  section: Section;
}
