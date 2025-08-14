import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import statusRoute from "./routes/example/status/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
    status: statusRoute,
  }),
});

export type AppRouter = typeof appRouter;