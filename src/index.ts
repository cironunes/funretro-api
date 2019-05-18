// import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as session from "express-session";
import * as cors from "cors";

import { typeDefs, resolvers } from "./schema";

const startServer = async () => {
  await createConnection();

  const server = new ApolloServer({
    // These will be defined for both new or existing servers
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
  });

  const app = express();

  app.use(cors({
    origin: 'http://localhost:8000',
    credentials: true,
  }));

  app.use(
    session({
      secret: "fjdaksfljsaj",
      resave: false,
      saveUninitialized: false
    })
  );

  app.options('*', cors())

  server.applyMiddleware({
    app,
    cors: false,
    path: "/",
  }); // app is from an existing express app

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
