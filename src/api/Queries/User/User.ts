import { Context } from "./../../../context";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { objectType, stringArg } from "@nexus/schema";
import { User, Post } from "@prisma/client";
import AuthResolver from "../../../Utills/Auth/AuthResolver";
import { prisma } from "../../Primsa/Prisma";

export const USERS = (t: ObjectDefinitionBlock<"Query">) => {
  t.field("CurrentUser", {
    type: "User",

    description: "Current User",
    nullable: true,
    resolve: AuthResolver(
      async (__: any, args: any, ctx: Context, _: any): Promise<User> => {
        try {
          const user: User = ctx.request.user;
          await prisma.user.findOne({
            include: {
              posts: true,
              likes: true,
              comments: true,
              rooms: true,
              followedBy: true,
              following: true,
              messegesSent: true,
              messegesReceived: true
            },
            where: { id: user.id }
          });

          return user;
        } catch (error) {
          throw new Error(`No User Found ${error.message}`);
        }
      }
    )
  });
};
