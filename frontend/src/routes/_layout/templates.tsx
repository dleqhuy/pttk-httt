import { createFileRoute } from "@tanstack/react-router"
import Planning from "@/features/pms/Planning"
export const Route = createFileRoute("/_layout/templates")({
  component: () => <Planning kind="templates" />,
  head: () => ({ meta: [{ title: "PMS · templates" }] }),
})
