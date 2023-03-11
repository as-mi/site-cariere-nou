import { z } from "zod";

/**
 * Default number of elements to display on each page of results.
 */
export const DEFAULT_PAGE_SIZE = 5;

/**
 * Data type for returning a paginated list of elements.
 */
export type PaginatedData<T> = {
  pageCount: number;
  results: T[];
};

export const PaginationParamsSchema = z.object({
  pageIndex: z.number().int().gte(0),
  pageSize: z.number().int().gte(5).lte(50),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
