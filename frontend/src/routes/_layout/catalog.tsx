import { createFileRoute } from "@tanstack/react-router"
import Catalog from "@/features/pms/Catalog"
export const Route = createFileRoute("/_layout/catalog")({
  component: () => <Catalog kind="catalog" />,
  head: () => ({ meta: [{ title: "PMS · catalog" }] }),
})
