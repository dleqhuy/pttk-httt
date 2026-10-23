import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorMessage, pmsApi, type Workspace } from "./api"
import { Empty, PageTitle, Panel, roleNames, WorkspaceView } from "./shared"

type Field = {
  key: string
  label: string
  type?: "email" | "number"
  optional?: boolean
  options?: { value: string; label: string }[]
}
type Section = {
  endpoint: string
  title: string
  fields: Field[]
  rows: { id: string; primary: string; secondary: string; detail: string }[]
}
const selectClass = "h-9 w-full rounded-md border bg-background px-3 text-sm"

export default function Catalog({
  kind,
}: {
  kind: "organization" | "catalog"
}) {
  return (
    <WorkspaceView>
      {(data) => <CatalogContent key={kind} data={data} kind={kind} />}
    </WorkspaceView>
  )
}
function CatalogContent({
  data,
  kind,
}: {
  data: Workspace
  kind: "organization" | "catalog"
}) {
  const client = useQueryClient()
  const [sectionIndex, setSectionIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState<Record<string, string>>({})
  const opts = (items: { id: string; name: string }[]) =>
    items.map((x) => ({ value: x.id, label: x.name }))
  const base: Field[] = [
    { key: "code", label: "Mã" },
    { key: "name", label: "Tên" },
  ]
  const sections: Section[] =
    kind === "organization"
      ? [
          {
            endpoint: "employees",
            title: "Nhân sự",
            fields: [
              { key: "code", label: "Mã nhân viên" },
              { key: "full_name", label: "Họ và tên" },
              { key: "email", label: "Email", type: "email" },
              {
                key: "campus_id",
                label: "Campus",
                options: opts(data.campuses),
              },
              {
                key: "designation_id",
                label: "Chức danh",
                options: opts(data.designations),
              },
              {
                key: "role",
                label: "Vai trò",
                options: Object.entries(roleNames).map(([value, label]) => ({
                  value,
                  label,
                })),
              },
              {
                key: "manager_id",
                label: "Quản lý",
                optional: true,
                options: data.employees
                  .filter((x) => x.role !== "employee")
                  .map((x) => ({ value: x.id, label: x.full_name })),
              },
              {
                key: "user_id",
                label: "ID tài khoản đăng nhập (UUID)",
                optional: true,
              },
            ],
            rows: data.employees.map((e) => ({
              id: e.id,
              primary: e.full_name,
              secondary: `${e.code} · ${e.email}`,
              detail: `${data.designations.find((d) => d.id === e.designation_id)?.name ?? "—"} · ${roleNames[e.role]}`,
            })),
          },
          {
            endpoint: "campuses",
            title: "Campus",
            fields: base,
            rows: data.campuses.map((c) => ({
              id: c.id,
              primary: c.name,
              secondary: c.code,
              detail: "Cơ sở hoạt động",
            })),
          },
          {
            endpoint: "designations",
            title: "Chức danh",
            fields: base,
            rows: data.designations.map((c) => ({
              id: c.id,
              primary: c.name,
              secondary: c.code,
              detail: "Dùng ánh xạ template",
            })),
          },
        ]
      : [
          {
            endpoint: "kras",
            title: "KRA",
            fields: [
              ...base,
              { key: "description", label: "Mô tả", optional: true },
            ],
            rows: data.kras.map((k) => ({
              id: k.id,
              primary: k.name,
              secondary: `${k.code} · ${k.description}`,
              detail: k.active ? "Active" : "Inactive",
            })),
          },
          {
            endpoint: "kpis",
            title: "KPI",
            fields: [
              ...base,
              {
                key: "kra_id",
                label: "Thuộc KRA",
                options: opts(data.kras.filter((k) => k.active)),
              },
              { key: "unit", label: "Đơn vị đo", optional: true },
              { key: "description", label: "Mô tả", optional: true },
            ],
            rows: data.kpis.map((k) => ({
              id: k.id,
              primary: k.name,
              secondary: `${k.code} · ${data.kras.find((x) => x.id === k.kra_id)?.name ?? "—"}`,
              detail: `${k.active ? "Active" : "Inactive"} ${k.unit ? `· ${k.unit}` : ""}`,
            })),
          },
        ]
  const section = sections[sectionIndex]
  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      pmsApi.post(`/${section.endpoint}`, payload),
    onSuccess: () => {
      toast.success("Đã tạo dữ liệu")
      setForm({})
      setOpen(false)
      client.invalidateQueries({ queryKey: ["pms-workspace"] })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const rows = section.rows.filter((r) =>
    `${r.primary} ${r.secondary} ${r.detail}`
      .toLocaleLowerCase("vi")
      .includes(search.toLocaleLowerCase("vi")),
  )
  return (
    <>
      <PageTitle
        eyebrow={kind === "organization" ? "M01 / Tổ chức" : "M02 / Thư viện"}
        title={
          kind === "organization" ? "Tổ chức & nhân sự" : "Thư viện KRA / KPI"
        }
        description={
          kind === "organization"
            ? "Quản lý campus, chức danh và phạm vi nhân sự của hệ thống."
            : "Xây dựng bộ tiêu chí đánh giá dùng chung trước khi tạo template."
        }
      >
        {data.role === "corporate_hr" && (
          <Button onClick={() => setOpen(!open)}>
            <Plus />
            {open ? "Đóng biểu mẫu" : `Thêm ${section.title}`}
          </Button>
        )}
      </PageTitle>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {sections.map((s, i) => (
            <Button
              key={s.endpoint}
              variant={sectionIndex === i ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSectionIndex(i)
                setForm({})
                setOpen(false)
                setSearch("")
              }}
            >
              {s.title} <span className="opacity-70">{s.rows.length}</span>
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Tìm kiếm"
            placeholder="Tìm kiếm…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {open && (
        <div className="mb-6">
          <Panel title={`Tạo ${section.title}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const payload: Record<string, unknown> = {}
                for (const field of section.fields) {
                  const value = form[field.key]
                  if (value)
                    payload[field.key] =
                      field.type === "number" ? Number(value) : value
                  else if (!field.optional) return
                }
                mutation.mutate(payload)
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {section.fields.map((field) => (
                <label
                  key={field.key}
                  htmlFor={`catalog-${field.key}`}
                  className="grid gap-2 text-sm"
                >
                  {field.label}
                  {field.options ? (
                    <select
                      id={`catalog-${field.key}`}
                      className={selectClass}
                      required={!field.optional}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    >
                      <option value="">Chọn…</option>
                      {field.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={`catalog-${field.key}`}
                      required={!field.optional}
                      type={field.type ?? "text"}
                      maxLength={field.key === "description" ? 2000 : 160}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Đang lưu…" : "Lưu dữ liệu"}
                </Button>
              </div>
            </form>
          </Panel>
        </div>
      )}
      <Panel title={`${section.title} · ${rows.length} bản ghi`}>
        {rows.length ? (
          <div className="divide-y">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="text-sm font-medium">{r.primary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.secondary}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {r.detail}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty text={search ? "Không có kết quả phù hợp." : undefined} />
        )}
      </Panel>
    </>
  )
}
