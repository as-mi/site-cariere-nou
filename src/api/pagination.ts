import { z } from "zod";

export const PaginationParamsSchema = z.object({
  pageIndex: z.number().int().gte(0),
  pageSize: z.number().int().gte(5).lte(50),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
