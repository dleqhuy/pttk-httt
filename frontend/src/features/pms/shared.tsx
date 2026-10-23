import { useQuery } from "@tanstack/react-query"
import { Loader2, RotateCw } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { errorMessage, pmsApi, type Workspace } from "./api"

export const roleNames: Record<string, string> = {
  corporate_hr: "Corporate HR",
  campus_hr: "Campus HR",
  manager: "L1 Manager",
  employee: "Employee",
}
const statuses: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã phát hành",
  ACTIVE: "Đang hoạt động",
  ASSIGNED: "Đã giao",
  SUBMITTED: "Đã xác nhận",
}
export function Status({ value }: { value: string }) {
  return (
    <Badge
      variant="outline"
      className={
        value === "DRAFT"
          ? "text-muted-foreground"
          : "border-primary/20 bg-primary/10 text-primary"
      }
    >
      {statuses[value] ?? value}
    </Badge>
  )
}
export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
export function WorkspaceView({
  children,
}: {
  children: (data: Workspace) => ReactNode
}) {
  const query = useQuery({
    queryKey: ["pms-workspace"],
    queryFn: async () => (await pmsApi.get<Workspace>("/workspace")).data,
  })
  if (query.isPending)
    return (
      <div
        role="status"
        className="flex items-center gap-3 py-20 text-muted-foreground"
      >
        <Loader2 className="size-5 animate-spin" />
        Đang tải không gian PMS…
      </div>
    )
  if (query.isError)
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 p-8">
        <h2 className="font-semibold">Chưa tải được dữ liệu</h2>
        <p className="my-3 text-sm text-muted-foreground">
          {errorMessage(query.error)}
        </p>
        <Button variant="outline" onClick={() => query.refetch()}>
          <RotateCw />
          Thử lại
        </Button>
      </div>
    )
  return children(query.data)
}
export function Empty({
  text = "Chưa có dữ liệu. Tạo bản ghi đầu tiên để bắt đầu.",
}: {
  text?: string
}) {
  return (
    <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      {text}
    </p>
  )
}
export function Panel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-xs">
      <h2 className="mb-5 font-semibold">{title}</h2>
      {children}
    </section>
  )
}
