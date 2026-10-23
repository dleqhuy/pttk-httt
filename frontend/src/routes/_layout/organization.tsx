import { createFileRoute } from "@tanstack/react-router"
import Catalog from "@/features/pms/Catalog"
export const Route = createFileRoute("/_layout/organization")({
  component: () => <Catalog kind="organization" />,
  head: () => ({ meta: [{ title: "PMS · organization" }] }),
})
