import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
});

// Create router and procedure
const router = t.router;
const publicProcedure = t.procedure;

// Define your tRPC router
export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` };
    }),
  status: publicProcedure.query(() => {
    return { status: 'ok' };
  }),
  hi: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return { message: `Hi ${input.name}!` };
    }),
});

export type AppRouter = typeof appRouter;

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc', // Your tRPC server URL
      transformer: superjson,
    }),
  ],
});

// Create Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});