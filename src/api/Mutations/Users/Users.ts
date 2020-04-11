import { Context } from "./../../../context";
import { GenUserToke } from "./../../../Utills/JWT/GenerateJwt";
import { User } from "@prisma/client";
import { stringArg } from "@nexus/schema";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import validateEmail from "../../../Utills/Mails/ValidateEmail";
import { SecretGenerator } from "../../../Utills/RandomWords/GenerateRandomWord";
import { Mails } from "../../../Utills/Mails/SendMail";
import AuthResolver from "../../../Utills/Auth/AuthResolver";

export const USERS = (t: ObjectDefinitionBlock<"Mutation">) => {
  t.crud.updateOneUser();
  t.crud.deleteOneUser();

  t.field("createUser", {
    type: "User",
    args: {
      username: stringArg({
        required: true,
        description: "User Name is A Required Field"
      }),
      email: stringArg({
        required: true,
        description: "Email is required"
      }),
      firstName: stringArg(),
      lastName: stringArg(),
      avatar: stringArg(),
      bio: stringArg()
    },
    resolve: async (__: any, args, ctx, _) => {
      try {
        let email = args.email.toLowerCase();
        if (!email) throw new Error(`You Must Provide Email Address`);

        const ValidEmail: Boolean = validateEmail(email);
        if (!ValidEmail)
          throw new Error(`The Email Address ${email} is Not Valid`);

        const Exists: User | null = await ctx.prisma.user.findOne({
          where: { email: email }
        });
        if (Exists) throw new Error(`User Already Exists`);

        return await ctx.prisma.user.create({
          data: {
            avatar: args.avatar,
            username: args.username,
            firstName: args.firstName,
            lastName: args.lastName,
            email: email,
            fullName:
              args.firstName && args.lastName
                ? args.firstName + " " + args.lastName
                : args.firstName || args.lastName || email,
            bio: args.bio ? args.bio : ""
          }
        });
      } catch (error) {
        throw new Error(`Unable To Create User Because ${error.message}`);
      }
    }
  });
  t.field("RequestLoginSecret", {
    type: "User",
    args: { email: stringArg({ required: true }) },
    description: "User Login Secrete Request",
    resolve: async (__: any, args, ctx, _) => {
      const prisma = ctx.prisma;
      try {
        const Exists = await prisma.user.findOne({
          where: { email: args.email }
        });
        if (!Exists) throw new Error(`No User Found With Provided Email`);
        const Secret = SecretGenerator();
        const UpdatedUser = await prisma.user.update({
          where: { email: args.email },
          data: { loginSecret: Secret }
        });

        Mails.LoginSecreteMail(UpdatedUser, Secret);
        return UpdatedUser;
      } catch (error) {
        throw new Error(`Unable To Create Key ${error.message}`);
      }
    }
  });
  t.field("ConfirmSecret", {
    type: "String",
    description: "Confirm User Login Secrete",
    args: {
      email: stringArg({ required: true }),
      key: stringArg({ required: true })
    },
    resolve: async (__: any, args, ctx, _) => {
      const prisma = ctx.prisma;
      try {
        const User = await prisma.user.findOne({
          where: { email: args.email }
        });
        if (!User) throw new Error(`No User Found`);
        if (User.loginSecret !== args.key) throw new Error(`Invalid Key`);
        const Token: string = GenUserToke(User.id);
        await prisma.user.update({
          where: { email: args.email },
          data: { loginSecret: null }
        });
        return Token;
      } catch (error) {
        throw new Error(`Unable Verify Key ${error.message}`);
      }
    }
  });
  t.field("FollowUnfollow", {
    type: "User",
    args: { id: stringArg() },
    description: "Follow and unfollow User",
    resolve: AuthResolver(
      async (__: any, args: { id: string }, ctx: Context, _: any) => {
        const { prisma, request } = ctx;

        try {
          const user: User = ctx.request.user;

          if (user.id === args.id)
            throw new Error(`You Cannot Follow Yourself`);

          const [Exists] = await prisma.user.findMany({
            select: { following: true },
            where: {
              AND: [{ id: user.id }, { following: { some: { id: args.id } } }]
            }
          });

          let USER;
          if (Exists) {
            USER = await prisma.user.update({
              where: { id: user.id },
              include: { following: true, followedBy: true },
              data: { following: { disconnect: { id: args.id } } }
            });
          } else {
            USER = await prisma.user.update({
              where: { id: user.id },
              include: { following: true, followedBy: true },
              data: {
                following: { connect: { id: args.id } }
              }
            });
          }
          return USER;
        } catch (error) {
          throw new Error(`Unable To Complete The Action ${error.message}`);
        }
      }
    )
  });
};
