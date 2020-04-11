import { Context } from "./../../../context";
import { ObjectDefinitionBlock } from "@nexus/schema/dist/core";
import { objectType, stringArg } from "@nexus/schema";
import { User, Room } from "@prisma/client";
import AuthResolver from "../../../Utills/Auth/AuthResolver";
import { prisma } from "../../Primsa/Prisma";

export const ROOMS = (t: ObjectDefinitionBlock<"Query">) => {
  t.field("Room", {
    type: "Room",
    nullable: false,
    args: { roomId: stringArg({ required: true }) },
    description: "Get Single Room",
    resolve: AuthResolver(
      async (
        __: any,
        args: { roomId: string },
        ctx: Context,
        _: any
      ): Promise<Room> => {
        try {
          const user: User = ctx.request.user;

          const Room: Room[] = await prisma.room.findMany({
            include: { participants: true, messeges: true },
            where: {
              participants: {
                some: {
                  AND: [
                    { id: user.id },
                    { rooms: { some: { id: args.roomId } } }
                  ]
                }
              }
            }
          });
          if (!Room) throw new Error(`Room Not Found`);
          const [CurrentRoom] = Room.filter(room => room.id === args.roomId);
          if (!CurrentRoom) throw new Error(`Room Not Found`);
          return CurrentRoom;
        } catch (error) {
          throw new Error(`Unable To Get The Room ${error.message}`);
        }
      }
    )
  });
};
