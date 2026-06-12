import { createFileRoute, Outlet } from "@tanstack/react-router";

// DEV PREVIEW: auth gate temporarily disabled so the admin UI can be reviewed
// without signing in. Re-enable before launch by restoring the getUser() check.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    return { user: null as unknown as { id: string } };
  },
  component: () => <Outlet />,
});
