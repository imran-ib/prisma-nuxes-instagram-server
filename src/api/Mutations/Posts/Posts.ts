import { Context } from "./../../../context";
import { stringArg } from "@nexus/schema";
import { User, Post, File, Like } from "@prisma/client";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { prisma } from "../../Primsa/Prisma";
import AuthResolver from "../../../Utills/Auth/AuthResolver";

export const POSTS = (t: ObjectDefinitionBlock<"Mutation">) => {
  t.field("CreatePost", {
    type: "Post",
    args: {
      caption: stringArg({ required: true }),
      location: stringArg(),
      files: stringArg({ list: true }),
    },
    description: "Create A Single post With Auther and file Connection",
    resolve: AuthResolver(
      async (
        parent: any,
        args: { caption: string; location: string; files: string[] },
        ctx: Context,
        info: any
      ) => {
        try {
          const user: User = ctx.request.user;

          const Post: Post = await prisma.post.create({
            include: { likes: true },
            data: {
              caption: args.caption,
              location: args.location,
              author: { connect: { id: user.id } },
            },
          });
          args.files &&
            args.files.forEach(async (file: any) => {
              await prisma.file.create({
                data: {
                  file: file,
                  post: { connect: { id: Post.id } },
                },
              });
            });

          return Post;
        } catch (error) {
          throw new Error(`Unable To Create Post ${error.message}`);
        }
      }
    ),
  });
  t.field("EditPost", {
    type: "Post",
    args: {
      postId: stringArg({ required: true }),
      caption: stringArg({ required: false }),
      location: stringArg({ required: false }),
      files: stringArg({ list: true, required: false }),
    },
    description: "Edit Post",
    resolve: AuthResolver(
      async (
        parent: any,
        args: {
          postId: string;
          caption: string;
          location: string;
          files: string[];
        },
        ctx: Context,
        info: any
      ) => {
        try {
          const user: User = ctx.request.user;
          const POST = await prisma.post.findOne({
            where: { id: args.postId },
          });
          const FILES: File[] = await prisma.file.findMany({
            where: { postId: args.postId },
          });
          if (!POST) throw new Error(`Post Not Found`);
          if (POST.authorId !== user.id)
            throw new Error(`You cannot Edit This Post`);
          const EditedPost = await prisma.post.update({
            where: { id: args.postId },
            data: {
              caption: args.caption,
              location: args.location,
            },
          });

          args.files &&
            args.files.forEach(async (file, i) => {
              await prisma.file.update({
                where: {
                  id: FILES[i].id,
                },
                data: {
                  file: file,
                },
              });
            });
          return EditedPost;
        } catch (error) {
          throw new Error(`Unable To Edit Post ${error.message}`);
        }
      }
    ),
  });
  t.field("DeletePost", {
    type: "String",
    args: { postId: stringArg({ required: true }) },
    description: "DeLete Post",
    resolve: AuthResolver(
      async (
        parent: any,
        args: { postId: string },
        ctx: Context,
        info: any
      ) => {
        try {
          const user: User = ctx.request.user;

          const Post: Post | null = await prisma.post.findOne({
            where: { id: args.postId },
          });
          if (!Post) throw new Error(`Post not Found`);

          if (Post.authorId !== user.id)
            throw new Error(`You Don't Have Permission To Do That`);

          // REVIEW this action is expensive on database but cascade delete is not supported yet
          // REVIEW Another Feature is comming to prisma 2 for Bulk operations (prisma.transaction)
          await prisma.file.deleteMany({ where: { postId: args.postId } });
          await prisma.like.deleteMany({ where: { postId: args.postId } });
          await prisma.comment.deleteMany({ where: { postId: args.postId } });
          const DeletedPost = await prisma.post.delete({
            where: { id: args.postId },
          });

          return "Success";
        } catch (error) {
          throw new Error(`Unable to complete The Action ${error.message}`);
        }
      }
    ),
  });
  t.field("ToggleLikePost", {
    type: "String",
    args: { postId: stringArg({ required: true }) },
    description: "Like Or Remove Like Post",
    resolve: AuthResolver(
      async (
        parent: any,
        args: { postId: string },
        ctx: Context,
        info: any
      ) => {
        try {
          const user: User = ctx.request.user;

          const [Exists]: Like[] = await prisma.like.findMany({
            where: {
              AND: [{ userId: user.id }, { postId: args.postId }],
            },
          });
          if (Exists) {
            await prisma.like.delete({
              where: {
                id: Exists.id,
              },
            });
          } else {
            await prisma.like.create({
              data: {
                post: { connect: { id: args.postId } },
                user: { connect: { id: user.id } },
              },
            });
          }

          return "Success";
        } catch (error) {
          throw new Error(`Unable To Complete The Action ${error.message}`);
        }
      }
    ),
  });
};
