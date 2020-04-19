import { Context } from "./../../../context";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { stringArg, intArg } from "@nexus/schema";
import { User, Post, Comment } from "@prisma/client";
import AuthResolver from "../../../Utills/Auth/AuthResolver";
import { prisma } from "../../Primsa/Prisma";

export const POSTS = (t: ObjectDefinitionBlock<"Query">) => {
  t.crud.posts({
    type: "Post",
    ordering: true,
    filtering: true,
  });
  t.list.field("Feeds", {
    type: "Post",
    args: {
      first: intArg(),
      last: intArg(),
      skip: intArg(),
      before: stringArg(),
      after: stringArg(),
    },
    resolve: AuthResolver(async (_: any, args: any, ctx: Context) => {
      try {
        const user: User = ctx.request.user;

        const Following = await prisma.user
          .findOne({
            where: {
              id: user.id,
            },
          })
          .following();

        const ids = Following.map((id) => id.id);

        const POST: Post[] = await prisma.post.findMany({
          include: {
            files: true,
            likes: true,
            comments: true,
          },

          orderBy: {
            createdAt: "desc",
          },

          before: args.before,
          after: args.after,
          last: args.last,
          first: args.first,
          skip: args.skip,
          where: {
            authorId: { in: [...ids, user.id] },
          },
        });

        return POST;
      } catch (error) {
        throw new Error(`Unable to fetch your feeds ${error.message}`);
      }
    }),
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
            where: { id: args.postId },
          });

          return Post;
        } catch (error) {
          throw new Error(`Unable To Get Post ${error.message}`);
        }
      }
    ),
  });

  t.field("Comments", {
    type: "Comment",
    description: "Get All Comments for One Post",
    args: { postId: stringArg({ required: true }) },
    nullable: true,
    list: true,
    resolve: AuthResolver(
      async (
        parent: any,
        args: { postId: string },
        ctx: Context,
        info: any
      ): Promise<Comment[] | null> => {
        try {
          const comments: Comment[] = await prisma.comment.findMany({
            where: {
              post: {
                id: args.postId,
              },
            },
            orderBy: { createdAt: "desc" },
          });
          return comments;
        } catch (error) {
          throw new error(error.message);
        }
      }
    ),
  });
};
