import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
  }
  type Comment {
    id: ID!
    text: String!
    author: User!
    card: Card!
  }
  type Card {
    id: ID!
    text: String!
    votes: [User]
    comments: [Comment]
    section: Section
  }
  type Section {
    id: ID!
    name: String!
    cards: [Card]
  }
  type Board {
    id: ID!
    name: String!
    maxVotes: Int!
    sections: [Section]
  }

  type Query {
    me: User
    boards: [Board]
    board(id: ID!): Board
    sections(boardId: ID!): [Section]
    cards(sectionId: ID!): [Card]
    comments(cardId: ID!): [Comment]
  }

  type Mutation {
    register(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
      photo: String
    ): Boolean!
    login(email: String!, password: String!): User

    createBoard(name: String!, maxVotes: Int!): Board
    updateBoard(boardId: ID!, name: String, maxVotes: Int): Boolean!
    deleteBoard(boardId: ID!): Boolean!
    addUserToBoard(userId: ID!, boardId: ID!): Boolean!
    removeUserFromBoard(userId: ID!, boardId: ID!): Boolean!

    createSection(name: String!, boardId: ID!): Section
    updateSection(name: String, sectionId: ID!): Section
    deleteSection(sectionId: ID!): Boolean!
    addCardToSection(cardId: ID!, sectionId: ID): Boolean!
    removeCardFromSection(cardId: ID!, sectionId: ID): Boolean!

    createCard(text: String!, sectionId: ID!): Card
    updateCard(id: ID!, text: String): Card
    deleteCard(id: ID!): Boolean!

    vote(cardId: ID!, userId: ID!): Boolean!
    unVote(cardId: ID!, userId: ID!): Boolean!

    comment(cardId: ID!, userId: ID!, text: String!): Boolean!
    updateComment(id: ID!, text: String!): Boolean!
    deleteComment(id: ID!): Boolean!
  }
`;
