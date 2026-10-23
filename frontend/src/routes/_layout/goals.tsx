import { createFileRoute } from "@tanstack/react-router"
import Planning from "@/features/pms/Planning"
export const Route = createFileRoute("/_layout/goals")({
  component: () => <Planning kind="goals" />,
  head: () => ({ meta: [{ title: "PMS · goals" }] }),
})
