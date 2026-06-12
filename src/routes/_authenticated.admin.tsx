import { createFileRoute, Outlet } from "@tanstack/react-router";

// DEV PREVIEW: admin role gate temporarily disabled. Re-enable by restoring
// the useIsAdmin() check before launch.
export const Route = createFileRoute("/_authenticated/admin")({
  component: () => <Outlet />,
});
