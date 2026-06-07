import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Route as ParentRoute } from "./_authenticated";
import { useIsAdmin } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { user } = ParentRoute.useRouteContext();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useIsAdmin(user);

  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      toast.error("Admin access required.");
      navigate({ to: "/" });
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <span className="eyebrow">Authorizing…</span>
      </div>
    );
  }
  if (!isAdmin) return null;
  return <Outlet />;
}
