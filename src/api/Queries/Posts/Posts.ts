import { Context } from "./../../../context";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { objectType, stringArg } from "@nexus/schema";
import { User, Post } from "@prisma/client";
import AuthResolver from "../../../Utills/Auth/AuthResolver";
import { prisma } from "../../Primsa/Prisma";

export const POSTS = (t: ObjectDefinitionBlock<"Query">) => {
  t.list.field("Feeds", {
    type: "Post",
    resolve: AuthResolver(async (_: any, args: any, ctx: Context) => {
      try {
        const user: User = ctx.request.user;

        const Following = await prisma.user
          .findOne({
            where: {
              id: user.id
            }
          })
          .following();

        const ids = Following.map(id => id.id);

        const POST: Post[] = await prisma.post.findMany({
          orderBy: {
            createdAt: "desc"
          },
          where: {
            authorId: { in: [...ids, user.id] }
          }
        });

        return POST;
      } catch (error) {
        throw new Error(`Unable to fetch your feeds ${error.message}`);
      }
    })
  });

  t.field("Post", {
    type: "Post",
    description: "Get Single Post",
    args: { postId: stringArg({ required: true }) },
    nullable: true,
    resolve: AuthResolver(
      async (__: any, args: { postId: string }, ctx: Context, _: any) => {
        try {
          const user: User = ctx.request.user;
          const Post: Post | null = await prisma.post.findOne({
            include: { files: true, comments: true, author: true, likes: true },
            where: { id: args.postId }
          });

          return Post;
        } catch (error) {
          throw new Error(`Unable To Get Post ${error.message}`);
        }
      }
    )
  });
};
