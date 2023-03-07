import { z } from "zod";

export type PaginatedData<T> = {
  pageCount: number;
  results: T[];
};

export const PaginationParamsSchema = z.object({
  pageIndex: z.number().int().gte(0),
  pageSize: z.number().int().gte(5).lte(50),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
