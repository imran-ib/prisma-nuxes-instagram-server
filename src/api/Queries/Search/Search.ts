import { Context } from "./../../../context";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { stringArg } from "@nexus/schema";
import { User, Post } from "@prisma/client";
import AuthResolver from "../../../Utills/Auth/AuthResolver";
import { prisma } from "../../Primsa/Prisma";
import { capitalizeFirstLetter } from "../../../Utills/FirstLetterUpperCase";

export const SEARCH = (t: ObjectDefinitionBlock<"Query">) => {
  t.list.field("UserSearch", {
    type: "User",
    description: "User Search Filter",
    nullable: true,

    args: { term: stringArg({ required: true }) },
    resolve: AuthResolver(
      async (
        __: any,
        args: { term: string },
        ctx: Context,
        _: any
      ): Promise<User[]> => {
        try {
          let Term: string = args.term.toLowerCase();
          console.log("SEARCH -> Term", Term);
          const UpperCaseTerm: string = Term.toUpperCase();
          console.log("SEARCH -> UpperCaseTerm", UpperCaseTerm);
          const FirstLetterUpper: string = capitalizeFirstLetter(Term);
          console.log("SEARCH -> FirstLetterUpper", FirstLetterUpper);

          const Users: User[] = await prisma.user.findMany({
            where: {
              OR: [
                {
                  firstName: { contains: FirstLetterUpper } || {
                      contains: UpperCaseTerm
                    } || { contains: Term }
                },
                {
                  email: { contains: FirstLetterUpper } || {
                      contains: UpperCaseTerm
                    } || { contains: Term }
                },
                {
                  lastName: { contains: FirstLetterUpper } || {
                      contains: UpperCaseTerm
                    } || { contains: Term }
                },
                {
                  fullName: { contains: FirstLetterUpper } || {
                      contains: UpperCaseTerm
                    } || { contains: Term }
                }
              ]
            }
          });
          console.log("SEARCH -> Users", Users);
          return Users;
        } catch (error) {
          throw new Error(`Unable To Complete Search ${error.message}`);
        }
      }
    )
  });
  t.list.field("SearchPost", {
    type: "Post",
    description: "Post Search Filter",
    nullable: true,
    args: { term: stringArg({ required: true }) },
    resolve: AuthResolver(
      async (
        __: any,
        args: { term: string },
        ctx: Context,
        _: any
      ): Promise<Post[]> => {
        try {
          let Term: string = args.term.toLowerCase();
          const UpperCaseTerm: string = Term.toUpperCase();
          const FirstLetterUpper: string = capitalizeFirstLetter(Term);

          const Posts: Post[] = await prisma.post.findMany({
            where: {
              OR: [
                {
                  caption: { contains: FirstLetterUpper } || {
                      contains: UpperCaseTerm
                    } || { contains: Term }
                },
                {
                  location: { contains: FirstLetterUpper } || {
                      contains: UpperCaseTerm
                    } || { contains: Term }
                }
              ]
            }
          });
          return Posts;
        } catch (error) {
          throw new Error(`Unable To Complete Search ${error.message}`);
        }
      }
    )
  });
};
