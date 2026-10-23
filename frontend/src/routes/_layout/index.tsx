import { createFileRoute } from "@tanstack/react-router"
import PmsDashboard from "@/features/pms/Dashboard"
export const Route = createFileRoute("/_layout/")({
  component: PmsDashboard,
  head: () => ({ meta: [{ title: "PMS · Tổng quan" }] }),
})
