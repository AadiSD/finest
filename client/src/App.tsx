// Referenced from javascript_log_in_with_replit blueprint
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Portfolio from "@/pages/portfolio";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/portfolio" component={Portfolio} />
        </>
      ) : (
        <>
          {isAdmin ? (
            <>
              <Route path="/" component={AdminDashboard} />
              <Route path="/portfolio" component={Portfolio} />
            </>
          ) : (
            <>
              <Route path="/" component={Landing} />
              <Route path="/portfolio" component={Portfolio} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="finest-hospitality-theme">
        <TooltipProvider>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
