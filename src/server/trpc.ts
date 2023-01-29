import { initTRPC } from "@trpc/server";

// Create a new tRPC instance
const t = initTRPC.create();

// Export the router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
