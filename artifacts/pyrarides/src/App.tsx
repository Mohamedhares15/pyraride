import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
    </div>
  );
}

// Lazy page imports
const HomePage = lazy(() => import("@/pages/HomePage"));
const StablesPage = lazy(() => import("@/pages/StablesPage"));
const StableDetailPage = lazy(() => import("@/pages/StableDetailPage"));
const PackagesPage = lazy(() => import("@/pages/PackagesPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const SignInPage = lazy(() => import("@/pages/SignInPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const TrainingPage = lazy(() => import("@/pages/TrainingPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const OfflinePage = lazy(() => import("@/pages/OfflinePage"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/stables" component={StablesPage} />
        <Route path="/stables/:id" component={StableDetailPage} />
        <Route path="/packages" component={PackagesPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/signin" component={SignInPage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/booking" component={BookingPage} />
        <Route path="/dashboard/:rest*" component={DashboardPage} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/training" component={TrainingPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/offline" component={OfflinePage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
