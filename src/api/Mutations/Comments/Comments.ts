import { Context } from "./../../../context";
import { stringArg } from "@nexus/schema";
import { User, Comment } from "@prisma/client";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { prisma } from "../../Primsa/Prisma";
import AuthResolver from "../../../Utills/Auth/AuthResolver";

export const COMMENTS = (t: ObjectDefinitionBlock<"Mutation">) => {
  t.field("CreateComment", {
    type: "Comment",
    args: {
      text: stringArg({ required: true }),
      postId: stringArg({ required: true })
    },
    description: "Create New Comment",
    resolve: AuthResolver(
      async (
        __: any,
        args: { text: string; postId: string },
        ctx: Context,
        _: any
      ) => {
        try {
          const user: User = ctx.request.user;
          const Comment: Comment = await prisma.comment.create({
            data: {
              author: { connect: { id: user.id } },
              post: { connect: { id: args.postId } },
              text: args.text
            }
          });
          return Comment;
        } catch (error) {
          throw new Error(error.message);
        }
      }
    )
  });
  t.field("EditComment", {
    type: "Comment",
    args: {
      text: stringArg({ required: true }),
      commentId: stringArg({ required: true })
    },
    description: "Edit Comment",
    resolve: AuthResolver(
      async (
        __: any,
        args: { text: string; commentId: string },
        ctx: Context,
        _: any
      ) => {
        try {
          const user: User = ctx.request.user;
          const Comment = await prisma.comment.update({
            where: { id: args.commentId },
            data: { text: args.text }
          });
          return Comment;
        } catch (error) {
          throw new Error(error.message);
        }
      }
    )
  });
  t.field("DeleteComment", {
    type: "String",
    args: {
      commentId: stringArg({ required: true })
    },
    description: "Delete Comment",
    resolve: AuthResolver(
      async (__: any, args: { commentId: string }, ctx: Context, _: any) => {
        try {
          const user: User = ctx.request.user;

          await prisma.comment.deleteMany({
            where: {
              AND: [{ id: args.commentId }, { authorId: user.id }]
            }
          });
          return `Success`;
        } catch (error) {
          throw new Error(error.message);
        }
      }
    )
  });
};
