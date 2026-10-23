import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, Plus, Send, Target } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage, pmsApi, type Workspace } from "./api"
import { Empty, PageTitle, Panel, Status, WorkspaceView } from "./shared"

const selectClass = "h-9 w-full rounded-md border bg-background px-3 text-sm"
type AssignmentResult = {
  assigned: number
  message: string
  issues: { employee_id: string; employee_name: string; code: string }[]
}
export default function Planning({
  kind,
}: {
  kind: "templates" | "cycles" | "goals"
}) {
  return (
    <WorkspaceView>
      {(data) => <PlanningContent key={kind} data={data} kind={kind} />}
    </WorkspaceView>
  )
}
function PlanningContent({
  data,
  kind,
}: {
  data: Workspace
  kind: "templates" | "cycles" | "goals"
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: "",
    name: "",
    campus_id: "",
    designation_id: "",
    year: new Date().getFullYear(),
    rubric: "",
  })
  const [kpiIds, setKpiIds] = useState<string[]>([])
  const [cycleFilter, setCycleFilter] = useState("")
  const [assignment, setAssignment] = useState<AssignmentResult | null>(null)
  const mutation = useMutation({
    mutationFn: async ({ path, body }: { path: string; body?: unknown }) =>
      (await pmsApi.post(path, body)).data,
    onSuccess: (result, variables) => {
      if (variables.path.endsWith("/assign")) {
        setAssignment(result)
        if (result.issues.length) {
          toast.warning(result.message)
          return
        }
      }
      toast.success(result.message ?? "Đã lưu thành công")
      setOpen(false)
      setForm({
        code: "",
        name: "",
        campus_id: "",
        designation_id: "",
        year: new Date().getFullYear(),
        rubric: "",
      })
      setKpiIds([])
      queryClient.invalidateQueries({ queryKey: ["pms-workspace"] })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const canCreate =
    kind === "templates"
      ? data.role === "corporate_hr"
      : kind === "cycles" && ["corporate_hr", "campus_hr"].includes(data.role)
  const title =
    kind === "templates"
      ? "Template & rubric"
      : kind === "cycles"
        ? "Chu kỳ đánh giá"
        : "Mục tiêu được giao"
  const goals = data.goals.filter(
    (g) => !cycleFilter || g.cycle_id === cycleFilter,
  )
  return (
    <>
      <PageTitle
        eyebrow={
          kind === "templates"
            ? "M03 / Cấu hình"
            : kind === "cycles"
              ? "M04–05 / Điều phối"
              : "M05 / Mục tiêu"
        }
        title={title}
        description={
          kind === "templates"
            ? "Bộ mục tiêu theo chức danh. Bản phát hành dùng để phân bổ cho nhân viên."
            : kind === "cycles"
              ? "Tạo chu kỳ theo campus và phân bổ từ template đã phát hành."
              : "Xem bộ mục tiêu, rubric và xác nhận trước khi bước vào đánh giá."
        }
      >
        {canCreate && (
          <Button onClick={() => setOpen(!open)}>
            <Plus />
            {open ? "Đóng biểu mẫu" : "Tạo mới"}
          </Button>
        )}
      </PageTitle>
      {open && (
        <div className="mb-6">
          <Panel title={kind === "templates" ? "Template mới" : "Chu kỳ mới"}>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate({
                  path: `/${kind}`,
                  body:
                    kind === "templates"
                      ? {
                          code: form.code,
                          name: form.name,
                          designation_id: form.designation_id,
                          rubric: form.rubric,
                          kpi_ids: kpiIds,
                        }
                      : {
                          code: form.code,
                          name: form.name,
                          campus_id: form.campus_id,
                          year: form.year,
                        },
                })
              }}
            >
              <label htmlFor="planning-code" className="grid gap-2 text-sm">
                Mã
                <Input
                  id="planning-code"
                  required
                  maxLength={40}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label htmlFor="planning-name" className="grid gap-2 text-sm">
                Tên
                <Input
                  id="planning-name"
                  required
                  maxLength={160}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              {kind === "templates" ? (
                <>
                  <label className="grid gap-2 text-sm">
                    Chức danh
                    <select
                      required
                      className={selectClass}
                      value={form.designation_id}
                      onChange={(e) =>
                        setForm({ ...form, designation_id: e.target.value })
                      }
                    >
                      <option value="">Chọn chức danh…</option>
                      {data.designations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <fieldset className="rounded-lg border p-3">
                    <legend className="px-1 text-sm">
                      KPI Active · chọn ít nhất một
                    </legend>
                    <div className="max-h-48 space-y-3 overflow-auto">
                      {data.kpis
                        .filter(
                          (k) =>
                            k.active &&
                            data.kras.some(
                              (r) => r.id === k.kra_id && r.active,
                            ),
                        )
                        .map((k) => (
                          <label
                            key={k.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={kpiIds.includes(k.id)}
                              onChange={(e) =>
                                setKpiIds(
                                  e.target.checked
                                    ? [...kpiIds, k.id]
                                    : kpiIds.filter((id) => id !== k.id),
                                )
                              }
                            />
                            {k.code} · {k.name}
                          </label>
                        ))}
                    </div>
                  </fieldset>
                  <label className="grid gap-2 text-sm sm:col-span-2">
                    Rubric (mô tả dùng chung cho bản cơ bản)
                    <textarea
                      required
                      maxLength={4000}
                      className="min-h-28 rounded-md border bg-background p-3"
                      value={form.rubric}
                      onChange={(e) =>
                        setForm({ ...form, rubric: e.target.value })
                      }
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="grid gap-2 text-sm">
                    Campus
                    <select
                      required
                      className={selectClass}
                      value={form.campus_id}
                      onChange={(e) =>
                        setForm({ ...form, campus_id: e.target.value })
                      }
                    >
                      <option value="">Chọn campus…</option>
                      {data.campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="planning-year" className="grid gap-2 text-sm">
                    Năm
                    <Input
                      id="planning-year"
                      type="number"
                      min={2000}
                      max={2200}
                      required
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: Number(e.target.value) })
                      }
                    />
                  </label>
                </>
              )}
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={
                    mutation.isPending ||
                    (kind === "templates" && !kpiIds.length)
                  }
                >
                  {mutation.isPending ? "Đang lưu…" : "Tạo bản nháp"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
      {kind === "templates" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {!data.templates.length && <Empty />}
          {data.templates.map((t) => (
            <Panel key={t.id} title={t.name}>
              <div className="mb-4 flex justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {t.code} ·{" "}
                  {
                    data.designations.find((d) => d.id === t.designation_id)
                      ?.name
                  }
                </p>
                <Status value={t.status} />
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {t.kpi_ids.map((id) => (
                  <span
                    className="rounded-md bg-muted px-2 py-1 text-xs"
                    key={id}
                  >
                    {data.kpis.find((k) => k.id === id)?.name ?? id}
                  </span>
                ))}
              </div>
              <p className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
                {t.rubric}
              </p>
              {t.status === "DRAFT" && data.role === "corporate_hr" && (
                <Button
                  className="mt-4"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({ path: `/templates/${t.id}/publish` })
                  }
                >
                  <Send />
                  Phát hành template
                </Button>
              )}
            </Panel>
          ))}
        </div>
      )}
      {kind === "cycles" && (
        <>
          {assignment && (
            <div
              role="status"
              className="mb-5 rounded-xl border bg-muted/40 p-5"
            >
              <p className="font-medium">{assignment.message}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {assignment.assigned} mục tiêu mới được tạo.
              </p>
              {assignment.issues.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {assignment.issues.map((issue) => (
                    <li key={issue.employee_id}>
                      {issue.employee_name}:{" "}
                      {(
                        {
                          MISSING_TEMPLATE: "Thiếu template đã phát hành",
                          DUPLICATE_TEMPLATE:
                            "Có nhiều template cho cùng chức danh",
                          EMPTY_TEMPLATE: "Template rỗng",
                        } as Record<string, string>
                      )[issue.code] ?? issue.code}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="space-y-4">
            {!data.cycles.length && <Empty />}
            {data.cycles.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <CalendarDays className="size-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.code} ·{" "}
                      {data.campuses.find((x) => x.id === c.campus_id)?.name} ·{" "}
                      {data.goals.filter((g) => g.cycle_id === c.id).length} mục
                      tiêu trong phạm vi xem
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Status value={c.status} />
                  {canCreate && (
                    <Button
                      variant="outline"
                      disabled={mutation.isPending}
                      onClick={() => {
                        setAssignment(null)
                        mutation.mutate({ path: `/cycles/${c.id}/assign` })
                      }}
                    >
                      <Target />
                      Phân bổ mục tiêu
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            Bản cơ bản dùng template toàn công ty đã phát hành. Cấu hình local,
            gửi duyệt, clone và gán lại thủ công chưa triển khai.
          </p>
        </>
      )}
      {kind === "goals" && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <select
              aria-label="Lọc chu kỳ"
              className={`${selectClass} max-w-sm`}
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
            >
              <option value="">Tất cả chu kỳ</option>
              {data.cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">
              {goals.length} mục tiêu trong phạm vi của bạn
            </span>
          </div>
          <div className="space-y-4">
            {!goals.length && (
              <Empty text="Chưa có mục tiêu. HR cần phân bổ từ chu kỳ trước." />
            )}
            {goals.map((g) => (
              <Panel key={g.id} title={g.snapshot.kpi_name}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {g.snapshot.kpi_code} ·{" "}
                    {
                      data.employees.find((e) => e.id === g.employee_id)
                        ?.full_name
                    }{" "}
                    · {data.cycles.find((c) => c.id === g.cycle_id)?.name}
                  </p>
                  <Status value={g.status} />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  Rubric · {g.snapshot.kra_name}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {g.snapshot.rubric}
                </p>
              </Panel>
            ))}
          </div>
          {data.employee_id && (
            <div className="mt-6 flex flex-wrap gap-3">
              {data.cycles
                .filter(
                  (c) =>
                    (!cycleFilter || c.id === cycleFilter) &&
                    goals.some(
                      (g) =>
                        g.cycle_id === c.id &&
                        g.employee_id === data.employee_id &&
                        g.status === "ASSIGNED",
                    ),
                )
                .map((c) => (
                  <Button
                    key={c.id}
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({ path: `/cycles/${c.id}/submit-goals` })
                    }
                  >
                    <Send />
                    Xác nhận mục tiêu · {c.name}
                  </Button>
                ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
