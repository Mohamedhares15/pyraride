import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/shared/SiteLayout";

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-foreground/30" />
    </div>
  );
}

const HomePage = lazy(() => import("@/pages/HomePage"));
const StablesPage = lazy(() => import("@/pages/StablesPage"));
const StableDetailPage = lazy(() => import("@/pages/StableDetailPage"));
const PackagesPage = lazy(() => import("@/pages/PackagesPage"));
const PackageDetailPage = lazy(() => import("@/pages/PackageDetailPage"));
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

const RiderDashboard = lazy(() => import("@/pages/dashboard/rider/page"));
const StableDashboard = lazy(() => import("@/pages/dashboard/stable/page"));
const CaptainDashboard = lazy(() => import("@/pages/dashboard/captain/page"));
const DriverDashboard = lazy(() => import("@/pages/dashboard/driver/page"));
const AnalyticsDashboard = lazy(() => import("@/pages/dashboard/analytics/page"));

const AdminStablesPage = lazy(() => import("@/pages/dashboard/admin/stables/page"));
const AdminHorsesPage = lazy(() => import("@/pages/dashboard/admin/horses/page"));
const AdminPackagesPage = lazy(() => import("@/pages/dashboard/admin/packages/page"));
const AdminAcademiesPage = lazy(() => import("@/pages/dashboard/admin/academies/page"));
const AdminLocationsPage = lazy(() => import("@/pages/dashboard/admin/locations/page"));
const AdminPremiumPage = lazy(() => import("@/pages/dashboard/admin/premium/page"));
const AdminTransportPage = lazy(() => import("@/pages/dashboard/admin/transport-zones/page"));
const AdminHorseChangesPage = lazy(() => import("@/pages/dashboard/admin/horse-changes/page"));
const AdminInstantBookingPage = lazy(() => import("@/pages/dashboard/admin/instant-booking/page"));

const CheckoutPackagePage = lazy(() => import("@/pages/checkout/package/[id]/page"));
const TrainingAcademyPage = lazy(() => import("@/pages/training/[academyId]/page"));

function Router() {
  return (
    <SiteLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/stables" component={StablesPage} />
          <Route path="/stables/:id" component={StableDetailPage} />
          <Route path="/packages/:id" component={PackageDetailPage} />
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
          <Route path="/pricing" component={PricingPage} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route path="/training/:academyId" component={TrainingAcademyPage} />
          <Route path="/training" component={TrainingPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/offline" component={OfflinePage} />
          <Route path="/checkout/package/:id" component={CheckoutPackagePage} />
          <Route path="/dashboard/rider" component={RiderDashboard} />
          <Route path="/dashboard/stable" component={StableDashboard} />
          <Route path="/dashboard/captain" component={CaptainDashboard} />
          <Route path="/dashboard/driver" component={DriverDashboard} />
          <Route path="/dashboard/analytics" component={AnalyticsDashboard} />
          <Route path="/dashboard/admin/stables" component={AdminStablesPage} />
          <Route path="/dashboard/admin/horses" component={AdminHorsesPage} />
          <Route path="/dashboard/admin/packages" component={AdminPackagesPage} />
          <Route path="/dashboard/admin/academies" component={AdminAcademiesPage} />
          <Route path="/dashboard/admin/locations" component={AdminLocationsPage} />
          <Route path="/dashboard/admin/premium" component={AdminPremiumPage} />
          <Route path="/dashboard/admin/transport-zones" component={AdminTransportPage} />
          <Route path="/dashboard/admin/horse-changes" component={AdminHorseChangesPage} />
          <Route path="/dashboard/admin/instant-booking" component={AdminInstantBookingPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>
    </SiteLayout>
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
