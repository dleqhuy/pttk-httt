import axios from "axios"

export type Campus = { id: string; code: string; name: string }
export type Employee = {
  id: string
  code: string
  full_name: string
  email: string
  campus_id: string
  designation_id: string
  manager_id: string | null
  user_id: string | null
  role: string
}
export type Kra = Campus & { description: string; active: boolean }
export type Kpi = Kra & { kra_id: string; unit: string }
export type Template = Campus & {
  designation_id: string
  rubric: string
  status: string
  kpi_ids: string[]
}
export type Cycle = Campus & { campus_id: string; year: number; status: string }
export type Goal = {
  id: string
  cycle_id: string
  employee_id: string
  status: string
  snapshot: {
    kpi_code: string
    kpi_name: string
    kra_name: string
    rubric: string
    unit: string
    template_name: string
  }
}
export type Workspace = {
  role: string
  employee_id: string | null
  campuses: Campus[]
  designations: Campus[]
  employees: Employee[]
  kras: Kra[]
  kpis: Kpi[]
  templates: Template[]
  cycles: Cycle[]
  goals: Goal[]
  stats: {
    employees: number
    cycles: number
    goals: number
    submitted_goals: number
  }
}
export const pmsApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api/v1/pms`,
})
pmsApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("access_token") ?? ""}`
  return config
})
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail))
      return detail
        .map((item) => `${item.loc?.slice(1).join(".")}: ${item.msg}`)
        .join("; ")
    if (!error.response)
      return "Không kết nối được backend. Kiểm tra API tại cổng 8000."
  }
  return "Không thể thực hiện thao tác. Vui lòng thử lại."
}
