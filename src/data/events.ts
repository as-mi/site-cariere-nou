import type { Event as PrismaEvent } from "@prisma/client";

import prisma from "~/lib/prisma";

import { DEFAULT_PAGE_SIZE, PaginatedData } from "~/data/pagination";

export type Event = Pick<PrismaEvent, "id" | "name"> & { date: string };

export default class Events {
  private constructor() {}

  public static async getPaginated(
    pageIndex: number = 0,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedData<Event>> {
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
  }
}
