import { z } from "zod";

import { EventKind } from "@prisma/client";

import prisma from "~/lib/prisma";

import { EntityId } from "../../schema";
import { adminProcedure, router } from "../..";

const ReadInput = z.object({ id: EntityId });
const EventFields = z.object({
  name: z.string().trim(),
  kind: z.enum([EventKind.WORKSHOP, EventKind.PRESENTATION]),
  location: z.string().trim(),
  date: z.coerce.date(),
  time: z.string().trim(),
  facebookEventUrl: z.string().trim(),
});
const CreateInput = EventFields;
const UpdateInput = z.object({ id: EntityId }).and(EventFields);
const DeleteInput = z.object({ id: EntityId });

export const eventRouter = router({
  read: adminProcedure.input(ReadInput).query(async ({ input }) => {
    const event = await prisma.event.findUnique({ where: { id: input.id } });
    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  }),
  create: adminProcedure.input(CreateInput).mutation(async ({ input }) => {
    await prisma.event.create({ data: input });
  }),
  update: adminProcedure.input(UpdateInput).mutation(async ({ input }) => {
    await prisma.event.update({
      where: { id: input.id },
      data: input,
    });
  }),
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input }) => {
    await prisma.event.delete({ where: { id: input.id } });
  }),
});
