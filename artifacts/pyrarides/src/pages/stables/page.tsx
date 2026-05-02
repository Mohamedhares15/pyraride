import { Suspense } from "react";
import StablesClient from "./StablesClient";
import { Loader2 } from "lucide-react";

export default function StablesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="sr-only">Loading stables...</span>
        </div>
      }
    >
      <StablesClient />
    </Suspense>
  );
}
