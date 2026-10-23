import { createFileRoute } from "@tanstack/react-router"
import Planning from "@/features/pms/Planning"
export const Route = createFileRoute("/_layout/cycles")({
  component: () => <Planning kind="cycles" />,
  head: () => ({ meta: [{ title: "PMS · cycles" }] }),
})
