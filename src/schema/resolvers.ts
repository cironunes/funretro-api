import { Card } from "./../entity/Card";
import { IResolvers } from "graphql-tools";
import { getConnection } from "typeorm";
import * as bcrypt from "bcryptjs";

import { User } from "../entity/User";
import { Board } from "../entity/Board";
import { Section } from "../entity/Section";
import { Comment } from "../entity/Comment";

const getUser = req => {
  const { userId } = req.session;
  return userId ? User.findOne(userId) : null;
};

const getBoards = async (userId: string) => {
  return await getConnection()
    .getRepository(Board)
    .createQueryBuilder("board")
    .leftJoinAndSelect("board.users", "user")
    .leftJoinAndSelect("board.sections", "section")
    .where("user.id = :userId", { userId })
    .getMany();
};

export const resolvers: IResolvers = {
  Query: {
    boards: async (_, __, { req }) => {
      const { userId } = req.session;
      const boards = await getBoards(userId);
      return boards;
    },
    board: async (_, { id }) => {
      const board = await Board.findOne(id, {
        relations: [
          "sections",
          "sections.cards",
          "sections.cards.votes",
          "sections.cards.comments",
          "sections.cards.comments.author"
        ]
      });
      return board;
    },
    sections: async (_, { boardId }) => {
      const sections = await getConnection()
        .getRepository(Section)
        .createQueryBuilder("section")
        .leftJoinAndSelect("section.board", "board")
        .leftJoinAndSelect("section.cards", "card")
        .where("board.id = :boardId", { boardId })
        .getMany();
      return sections;
    },
    cards: async (_, { sectionId }) => {
      const cards = await getConnection()
        .getRepository(Card)
        .createQueryBuilder("card")
        .leftJoinAndSelect("card.votes", "vote")
        .leftJoinAndSelect("card.comments", "comments")
        .leftJoinAndSelect("card.section", "section")
        .where("section.id = :sectionId", { sectionId })
        .getMany();
      return cards;
    },
    comments: async (_, { cardId }) => {
      const comments = await getConnection()
        .getRepository(Comment)
        .createQueryBuilder("comment")
        .leftJoinAndSelect("comment.card", "card")
        .leftJoinAndSelect("comment.author", "author")
        .where("card.id = :cardId", { cardId })
        .getMany();
      return comments;
    },
    me: async (_, __, { req }) =>
      req.session.userId ? await User.findOne(req.session.userId) : null
  },
  Mutation: {
    register: async (_, { firstName, lastName, email, password, photo }) => {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        photo: photo || ""
      }).save();

      return true;
    },
    login: async (_, { email, password }, { req }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      req.session.userId = user.id;
      return user;
    },

    createBoard: async (_, { name, maxVotes }, { req }) => {
      const { manager } = getConnection();
      const user = await getUser(req);

      const board = new Board();
      board.name = name;
      board.maxVotes = maxVotes;
      board.users = [user];

      await manager.save(board);

      return board;
    },
    updateBoard: async (_, { boardId, name, maxVotes }) => {
      const board = await Board.findOne(boardId);
      board.name = name || board.name;
      board.maxVotes = maxVotes || board.maxVotes;
      board.save();
      return true;
    },
    deleteBoard: async (_, { boardId }) => {
      const { manager } = getConnection();
      manager.delete(Board, boardId);
      return true;
    },
    addUserToBoard: async (_, { userId, boardId }) => {
      const user = await User.findOne(userId);
      const board = await Board.findOne(boardId);

      await getConnection()
        .createQueryBuilder()
        .relation(Board, "users")
        .of(board)
        .add(user);

      return true;
    },
    removeUserFromBoard: async (_, { userId, boardId }) => {
      const { manager } = getConnection();
      const board = await Board.findOne(boardId, { relations: ["users"] });
      board.users = board.users.filter(user => user.id.toString() !== userId);
      manager.save(board);
      return true;
    },

    createSection: async (_, { name, boardId }) => {
      const { manager } = getConnection();

      const board = await Board.findOne(boardId);
      const section = new Section();
      section.name = name;
      section.board = board;

      manager.save(section);
      return section;
    },
    updateSection: async (_, { name, sectionId }) => {
      const { manager } = getConnection();
      const section = await Section.findOne(sectionId);
      section.name = name;
      manager.save(section);
      return section;
    },
    deleteSection: async (_, { sectionId }) => {
      const { manager } = getConnection();
      manager.delete(Section, sectionId);
      return true;
    },
    addCardToSection: async (_, { cardId, sectionId }) => {
      const { manager } = getConnection();
      const card = await Card.findOne(cardId, { relations: ["section"] });
      const section = await Section.findOne(sectionId);
      card.section = section;
      manager.save(card);
      return true;
    },
    removeCardFromSection: async (_, { cardId, sectionId }) => {
      const { manager } = getConnection();
      const card = await Card.findOne(cardId, { relations: ["section"] });
      const section = await Section.findOne(sectionId);
      card.section = section;
      manager.save(card);
      return true;
    },

    createCard: async (_, { text, sectionId }) => {
      const { manager } = getConnection();

      const section = await Section.findOne(sectionId);
      const card = new Card();
      card.text = text;
      card.section = section;
      manager.save(card);
      return card;
    },
    updateCard: async (_, { text, id }) => {
      const { manager } = getConnection();
      const card = await Card.findOne(id);
      card.text = text;
      manager.save(card);
      return card;
    },
    deleteCard: async (_, { id }) => {
      const { manager } = getConnection();
      manager.delete(Card, id);
      return true;
    },

    vote: async (_, { cardId, userId }) => {
      const card = await Card.findOne(cardId);
      const user = await User.findOne(userId);

      await getConnection()
        .createQueryBuilder()
        .relation(Card, "votes")
        .of(card)
        .add(user);

      return true;
    },
    unVote: async (_, { cardId, userId }) => {
      const { manager } = getConnection();
      const card = await Card.findOne(cardId, { relations: ["votes"] });
      card.votes = card.votes.filter(vote => vote.id.toString() !== userId);
      manager.save(card);
      return true;
    },

    comment: async (_, { cardId, userId, text }) => {
      const card = await Card.findOne(cardId);
      const user = await User.findOne(userId);

      const comment = new Comment();
      comment.text = text;
      comment.author = user;
      comment.card = card;

      comment.save();

      return true;
    },
    updateComment: async (_, { id, text }) => {
      const { manager } = getConnection();
      const comment = await Comment.findOne(id);
      comment.text = text;
      manager.save(comment);
      return true;
    },
    deleteComment: async (_, { id }) => {
      const { manager } = getConnection();
      manager.delete(Comment, id);
      return true;
    }
  }
};
