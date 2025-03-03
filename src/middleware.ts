import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes using the correct pattern
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)", 
  "/sign-up(.*)",
  "/api/trpc(.*)" // Allow TRPC routes to be public
]);

// Use the updated middleware pattern with auth parameter
export default clerkMiddleware(async (auth, req) => {
  // If it's a public route, allow access without authentication
  if (isPublicRoute(req)) {
    return;
  }
  
  // For all other routes, require authentication
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
