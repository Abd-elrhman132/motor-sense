import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { LoadingScreen } from "@/components/LoadingScreen";

function NotFoundComponent() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-7xl font-bold">404</h1>
        <p className="text-muted-foreground mt-2 text-sm">Page not found.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-xl font-semibold">This page didn't load</h1>
        <p className="text-muted-foreground mt-2 text-sm">Something went wrong.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for the full page to load (assets, fonts, CSS)
    const handleLoad = () => {
      // Add a small artificial delay to ensure smooth transition
      // and allow heavy initial React renders (like WebGL canvas) to paint
      setTimeout(() => setIsLoading(false), 800);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans antialiased">
      <LoadingScreen isLoading={isLoading} />
      <Outlet />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
