import { z } from "zod";

import { EventKind } from "@prisma/client";

import { PaginationParamsSchema } from "~/api/pagination";
import { revalidateHomePage } from "~/api/revalidation";

import prisma from "~/lib/prisma";
import { randomChoice } from "~/lib/random";

import { EntityId } from "../../schema";
import { adminProcedure, router } from "../..";

const ReadInput = z.object({ id: EntityId });
const ReadManyInput = PaginationParamsSchema;
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
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;

    const skip = pageIndex * pageSize;
    const take = pageSize;

    const eventsCount = await prisma.event.count();
    const pageCount = Math.ceil(eventsCount / pageSize);

    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        date: true,
      },
      skip,
      take,
      orderBy: { id: "asc" },
    });

    const results = events.map((event) => ({
      ...event,
      date: event.date.toLocaleDateString("ro", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }));

    return {
      pageCount,
      results,
    };
  }),
  create: adminProcedure.input(CreateInput).mutation(async ({ input, ctx }) => {
    await prisma.event.create({ data: input });

    await revalidateHomePage(ctx);
  }),
  createFake: adminProcedure.mutation(async () => {
    const { _max } = await prisma.event.aggregate({ _max: { id: true } });

    const id = _max.id ?? 1;

    const name = `Eveniment #${id}`;
    const kind = randomChoice(EventKind.WORKSHOP, EventKind.PRESENTATION);

    const time = `${8 + Math.floor(Math.random() * 10)}:00`;

    await prisma.event.create({
      data: {
        name,
        kind,
        location: "Locație de test",
        date: new Date(),
        time,
      },
    });
  }),
  update: adminProcedure.input(UpdateInput).mutation(async ({ input, ctx }) => {
    await prisma.event.update({
      where: { id: input.id },
      data: input,
    });

    await revalidateHomePage(ctx);
  }),
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input, ctx }) => {
    await prisma.event.delete({ where: { id: input.id } });

    await revalidateHomePage(ctx);
  }),
});
