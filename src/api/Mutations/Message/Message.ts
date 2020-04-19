import { Context } from "./../../../context";
import { stringArg } from "@nexus/schema";
import { User, Message } from "@prisma/client";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { prisma } from "../../Primsa/Prisma";
import AuthResolver from "../../../Utills/Auth/AuthResolver";
import { MESSAGE_CHANNEL } from "../../../Utills/CONSTANTS";

export const MESSAGE = (t: ObjectDefinitionBlock<"Mutation">) => {
  t.field("CreateMessage", {
    type: "Message",
    description: "Create Chat Message",
    nullable: true,
    args: {
      roomId: stringArg(),
      text: stringArg(),
      toId: stringArg(),
    },
    resolve: AuthResolver(
      async (
        __: any,
        args: {
          roomId: string;
          text: string;
          toId: string;
        },
        ctx: Context,
        info: any
      ): Promise<any> => {
        try {
          const user: User = ctx.request.user;
          if (args.toId === user.id) throw new Error(`You Are not Allowed`);
          let chatRoom;
          if (!args.roomId) {
            chatRoom = await prisma.room.create({
              include: { participants: true },
              data: {
                participants: {
                  connect: [{ id: user.id }, { id: args.toId }],
                },
              },
            });
          } else {
            chatRoom = await prisma.room.findOne({
              include: { participants: true },
              where: {
                id: args.roomId,
              },
            });
          }
          if (!chatRoom) throw Error(`Room Not Found`);

          const GetId =
            chatRoom.participants &&
            chatRoom.participants.filter(
              (participants: { id: string }) =>
                participants && participants.id !== user.id
            )[0];

          const NewMessage: any = await prisma.message.create({
            data: {
              text: args.text,
              receiver: {
                connect: {
                  id: user.id,
                },
              },
              sender: {
                connect: {
                  id: args.roomId ? GetId && GetId.id : args.toId,
                },
              },
              room: {
                connect: {
                  id: chatRoom.id,
                },
              },
            },
          });
          NewMessage.ROOMID = chatRoom.id;

          ctx.pubsub.publish(MESSAGE_CHANNEL, { newMessage: NewMessage });

          return NewMessage;
        } catch (error) {
          throw Error(`Some went Wrong ${error.message}`);
        }
      }
    ),
  });
};
