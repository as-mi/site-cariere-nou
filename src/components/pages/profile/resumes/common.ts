import type { RouterOutput } from "~/lib/trpc";

export type Resume = RouterOutput["participant"]["resumeGetAll"][0];
