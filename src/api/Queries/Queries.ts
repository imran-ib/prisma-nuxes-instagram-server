import { Context } from "./../../context";
import { objectType, stringArg } from "@nexus/schema";
import AuthResolver from "../../Utills/Auth/AuthResolver";
import { User, Post } from "@prisma/client";
import { prisma } from "../Primsa/Prisma";
import { POSTS } from "./Posts/Posts";
import { SEARCH } from "./Search/Search";
import { ROOMS } from "./Rooms/Rooms";
import { USERS } from "./User/User";

export const Query = objectType({
  name: "Query",
  definition(t) {
    POSTS(t);
    SEARCH(t);
    ROOMS(t);
    USERS(t);
  }
});
