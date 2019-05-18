import { Board } from "./Board";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToMany
} from "typeorm";

import { Comment } from "./Comment";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column("text")
  email: string;

  @Column("text")
  password: string;

  @Column()
  photo: string;

  @OneToMany(type => Comment, comment => comment.author)
  comments: Comment[];

  @ManyToMany(() => Board, board => board.users)
  boards: Board[];
}
