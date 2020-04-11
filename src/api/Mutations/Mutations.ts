import { mutationType } from "@nexus/schema";

import { USERS } from "./Users/Users";
import { POSTS } from "./Posts/Posts";
import { COMMENTS } from "./Comments/Comments";
import { MESSAGE } from "./Message/Message";

export const Mutation = mutationType({
  definition(t) {
    POSTS(t);
    USERS(t);
    COMMENTS(t);
    MESSAGE(t);
  }
});
