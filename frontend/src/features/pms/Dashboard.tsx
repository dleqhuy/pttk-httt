import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  CalendarDays,
  CheckCheck,
  Target,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import {
  Empty,
  PageTitle,
  Panel,
  roleNames,
  Status,
  WorkspaceView,
} from "./shared"

export default function PmsDashboard() {
  const { user } = useAuth()
  return (
    <WorkspaceView>
      {(data) => {
        const cards = [
          {
            label: "Nhân sự trong phạm vi",
            value: data.stats.employees,
            icon: Users,
          },
          {
            label: "Chu kỳ đánh giá",
            value: data.stats.cycles,
            icon: CalendarDays,
          },
          {
            label: "Mục tiêu đã phân bổ",
            value: data.stats.goals,
            icon: Target,
          },
          {
            label: "Mục tiêu đã xác nhận",
            value: data.stats.submitted_goals,
            icon: CheckCheck,
          },
        ]
        const progress = data.stats.goals
          ? Math.round((data.stats.submitted_goals / data.stats.goals) * 100)
          : 0
        return (
          <>
            <PageTitle
              eyebrow="PMS / Tổng quan"
              title={`Xin chào, ${user?.full_name || "bạn"}`}
              description="Theo dõi cấu hình, chu kỳ và tiến độ xác nhận mục tiêu trong phạm vi của bạn."
            >
              <span className="rounded-full border px-3 py-1.5 text-xs font-medium">
                {roleNames[data.role]}
              </span>
            </PageTitle>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border bg-card p-5 shadow-xs"
                >
                  <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{label}</span>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight">
                    {value.toString().padStart(2, "0")}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <Panel title="Chu kỳ đánh giá">
                <div className="space-y-3">
                  {data.cycles.length ? (
                    data.cycles.slice(0, 5).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {c.code} ·{" "}
                            {
                              data.campuses.find((x) => x.id === c.campus_id)
                                ?.name
                            }
                          </p>
                        </div>
                        <Status value={c.status} />
                      </div>
                    ))
                  ) : (
                    <Empty text="Chưa có chu kỳ đánh giá." />
                  )}
                </div>
                <Button asChild variant="ghost" className="mt-4">
                  <Link to="/cycles">
                    Xem các chu kỳ <ArrowRight />
                  </Link>
                </Button>
              </Panel>
              <Panel title="Tiến độ xác nhận mục tiêu">
                <p className="text-4xl font-semibold tracking-tight text-primary">
                  {progress}%
                </p>
                <div className="my-5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {data.stats.submitted_goals} / {data.stats.goals} mục tiêu đã
                  được nhân viên xác nhận. Dữ liệu cập nhật từ backend.
                </p>
                <Button asChild variant="outline" className="mt-6">
                  <Link to="/goals">
                    Xem mục tiêu <ArrowRight />
                  </Link>
                </Button>
              </Panel>
            </div>
            <div className="mt-6 rounded-xl border bg-card p-6">
              <h2 className="font-semibold">Lộ trình đánh giá hiệu suất</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  "Thư viện KPI",
                  "Template & rubric",
                  "Chu kỳ",
                  "Phân bổ mục tiêu",
                  "Đánh giá",
                  "Chuẩn hóa",
                ].map((step, i) => (
                  <div key={step} className="rounded-lg border p-3">
                    <span
                      className={`text-xs font-semibold ${i < 4 ? "text-primary" : "text-muted-foreground"}`}
                    >
                      0{i + 1}
                    </span>
                    <p className="mt-2 text-xs font-medium">{step}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {i < 4 ? "Có nền tảng" : "Chưa triển khai"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      }}
    </WorkspaceView>
  )
}
