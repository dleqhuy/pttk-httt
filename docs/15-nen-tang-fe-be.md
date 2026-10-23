# 15 — Nền tảng FE/BE đã triển khai

## 1. Nguồn và stack

Dùng mã nguồn thực tế từ [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template), giữ giấy phép MIT. Commit cụ thể được ghi ở [template-upstream.md](template-upstream.md). Giữ lại BPMN và toàn bộ phân tích nghiệp vụ `00–14`.

Backend: Python 3.14, FastAPI, SQLModel, Alembic, JWT và password hashing của template. Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Router/Query. PostgreSQL là DB theo template; bổ sung SQLite cho local demo và kiểm thử tách biệt. Build frontend được FastAPI phục vụ trên cùng origin; Vite dùng proxy `/api` khi phát triển.

## 2. Phạm vi hiện có

| Module | Đã triển khai | Chưa triển khai |
|---|---|---|
| Nền template | Login/JWT, tài khoản admin, đăng ký, trang tài khoản, giao diện responsive/light-dark | SSO; email cần cấu hình SMTP nếu muốn sử dụng |
| M01 | Tạo/xem campus, designation, employee; liên kết user; 4 role; lọc dữ liệu theo scope | Sửa/chuyển campus, quản lý quan hệ theo hiệu lực, ủy quyền, import HRIS |
| M02 | Tạo/xem KRA và KPI; quan hệ KRA–KPI; kiểm tra Active khi tạo/phát hành template | UI sửa/Inactive, version danh mục đầy đủ |
| M03 | Tạo template theo một designation, chọn nhiều KPI Active, rubric mô tả, phát hành | Rubric cấu trúc theo từng KPI, global/custom inheritance, version library đầy đủ |
| M04 | Tạo/xem cycle theo campus và năm | Clone, local config, approval/rejection, lịch mở từng review |
| M05 | Gán tự động; báo thiếu/trùng; bảo toàn goal đã gán; snapshot; xác nhận mục tiêu chính chủ | Gán lại thủ công, batch job, điều chỉnh goal, tập participant riêng |
| M06–M09 | Chỉ có tài liệu phân tích | Review, feedback, achievement, công thức điểm, normalization, publish result |
| M10 | Toast kết quả thao tác trên FE | Notification lưu DB, gửi email nghiệp vụ, outbox/audit đầy đủ |

Không có thuật toán chấm điểm hoặc chuẩn hóa được tự đặt ra trong bản nền tảng.

Các danh mục hiện hỗ trợ **tạo và xem**, không phải CRUD hoàn chỉnh. Chưa có endpoint sửa/xóa PMS để tránh phá snapshot và quan hệ khi vòng đời thay đổi chưa được chốt. Route `/items` nguyên bản vẫn còn trong mã nguồn template, được bỏ khỏi navigation PMS.

## 3. Khởi tạo và chạy local

Từ thư mục gốc:

```bash
bash scripts/setup.sh
bash scripts/dev.sh
```

`setup.sh` tạo `.env` từ `.env.example` nếu chưa có, thay placeholder bằng secret/mật khẩu ngẫu nhiên, cài Python/Bun dependencies theo lockfile và bootstrap dữ liệu mẫu. Không ghi đè `.env` đã tồn tại. Nếu tự copy `.env.example`, cần thay các placeholder bằng giá trị của mình.

`dev.sh` khởi tạo dữ liệu local nếu cần, chạy FastAPI tại `127.0.0.1:8000` và Vite tại `127.0.0.1:5173`. Truy cập [http://localhost:5173](http://localhost:5173); API tại [http://localhost:8000/docs](http://localhost:8000/docs). Dừng bằng Ctrl+C.

Chạy từng phần riêng nếu cần:

```bash
# Terminal backend, bắt đầu từ thư mục gốc
cd backend
uv run --package app python -m app.pms.bootstrap --demo
uv run --package app fastapi dev --host 127.0.0.1
```

```bash
# Terminal frontend, bắt đầu từ thư mục gốc
bun run dev
```

Local DB: `backend/pms.db`, được Git ignore. Bootstrap SQLite dùng `metadata.create_all` riêng cho development, không phải cơ chế migration schema của DB cũ. Nếu thay schema sau này, cần migration/chuyển dữ liệu thích hợp; chạy bootstrap không tự ALTER bảng có sẵn.

## 4. Tài khoản và kịch bản demo

| Tài khoản | Vai trò | Mật khẩu |
|---|---|---|
| `admin@example.com` | Superuser, tương đương Corporate HR trong PMS | `FIRST_SUPERUSER_PASSWORD` trong `.env` |
| `campus.hr@example.com` | Campus HR của HCM | `PMS_DEMO_PASSWORD` trong `.env` |
| `minhanh@example.com` | L1 Manager, quản lý Hoàng Nam | `PMS_DEMO_PASSWORD` trong `.env` |
| `hoangnam@example.com` | Employee | `PMS_DEMO_PASSWORD` trong `.env` |

Dữ liệu đều là minh họa: một campus HCM, một designation Chuyên viên, một KRA/KPI, template đã phát hành và cycle 2026. Ba nhân viên mẫu cùng designation để thử gán mục tiêu; đây không phải cơ cấu nhân sự thật. Demo accounts chỉ được tạo khi chạy rõ `--demo` và có `PMS_DEMO_PASSWORD`.

Luồng kiểm tra:

1. Admin vào **Chu kỳ đánh giá**, chọn **Phân bổ mục tiêu** cho chu kỳ mẫu.
2. Hệ thống tạo mục tiêu cho ba nhân sự trong campus. Chạy lại không tạo thêm bản sao.
3. Đăng xuất, đăng nhập Employee Hoàng Nam, vào **Mục tiêu** để xem snapshot KPI/rubric và chọn **Xác nhận mục tiêu** của chu kỳ.
4. Manager Minh Anh xem được hồ sơ của mình và nhân viên trực tiếp; Campus HR xem campus; Employee chỉ xem hồ sơ chính mình.
5. Tạo thêm một template Published cho cùng designation rồi tạo chu kỳ khác để kiểm tra nhánh trùng. Không chọn ngẫu nhiên template đầu tiên khi có nhiều bản phù hợp.

Không reset mật khẩu tài khoản đã tồn tại khi chạy lại bootstrap. Tài khoản mới không có Employee liên kết chưa có hồ sơ/mục tiêu PMS; superuser tạo tài khoản tại **Tài khoản**, rồi gắn `user_id` của nó khi tạo Employee. Không tự gắn theo email của tài khoản đã tồn tại.

## 5. API PMS hiện có

Tất cả route có prefix `/api/v1/pms`, cần JWT Bearer. Swagger có schema input chi tiết.

| Method / path | Quyền | Hành vi |
|---|---|---|
| GET `/workspace` | Đã đăng nhập | Dữ liệu tổng hợp dashboard, danh mục và hồ sơ được lọc scope |
| POST `/campuses` | Corporate HR | Tạo campus |
| POST `/designations` | Corporate HR | Tạo chức danh |
| POST `/employees` | Corporate HR | Tạo nhân sự, liên kết tài khoản/manager, cấp role PMS |
| POST `/kras` | Corporate HR | Tạo KRA |
| POST `/kpis` | Corporate HR | Tạo KPI thuộc KRA |
| POST `/templates` | Corporate HR | Tạo bản DRAFT từ các KPI/KRA Active |
| POST `/templates/{id}/publish` | Corporate HR | Phát hành template có KPI hợp lệ |
| POST `/cycles` | Corporate HR hoặc Campus HR đúng campus | Tạo cycle DRAFT |
| POST `/cycles/{id}/assign` | Corporate HR hoặc Campus HR đúng campus | Preview lỗi hoặc gán toàn bộ phần chưa có goal, đổi cycle ACTIVE |
| POST `/cycles/{id}/submit-goals` | User đã liên kết Employee, hồ sơ chính mình | Xác nhận bộ goal trong cycle ACTIVE |

Mã lỗi: 401 thiếu token; 403 sai quyền; 404 thiếu đối tượng tham chiếu; 409 trùng dữ liệu/xung đột trạng thái; 422 input không hợp lệ hoặc chưa đủ dữ liệu. Phân bổ có lỗi mapping trả 200 kèm `assigned=0` và `issues` để FE hiển thị danh sách; không ghi goal nào trong lần đó.

`/workspace` đang trả tập dữ liệu trong scope, chưa có pagination. Đây là API phục vụ bản nền tảng; khi quy mô lớn cần chia query/pagination. FE dùng `features/pms/api.ts` để mô tả aggregate workspace; các model/input endpoint được bổ sung vào client OpenAPI sinh tự động của template.

## 6. Dữ liệu và quy tắc đã thực hiện

Chín bảng PMS: `campus`, `designation`, `employee`, `kra`, `kpi`, `goaltemplate`, `templatekpi`, `appraisalcycle`, `goal`.

- Code danh mục là duy nhất; Employee email/user link được ràng buộc duy nhất.
- Chỉ Corporate HR cấp role/liên kết user qua API nhân sự; client không tự nâng role.
- Campus HR tạo/gán cycle đúng campus; Manager chỉ đọc mục tiêu của mình và nhân viên trực tiếp; Employee chỉ đọc hồ sơ của mình.
- Template hiện một designation, nhiều KPI, một rubric dạng text dùng chung. Chưa coi đây là thư viện rubric hoàn chỉnh theo tài liệu phân tích.
- Phân bổ xét toàn bộ Employee của campus, chưa có tập participant theo từng cycle. Khi thêm/chuyển/nghỉ nhân viên cần mở rộng module participant trước dùng thật.
- Chỉ phân bổ từ Published template; thiếu hoặc nhiều template đều báo lỗi. Nếu có một người lỗi, không ghi phần goal mới còn lại trong request đó.
- Chạy lại giữ bộ goal/snapshot đã tồn tại, kể cả đã submit. Khóa unique chống tạo bản sao khi request đồng thời; request xung đột trả 409 để tải lại.
- Snapshot chứa KPI/KRA/rubric/template và manager ID tại lúc gán. Scope Manager trong bản hiện tại đọc theo quan hệ hiện hành; chưa có API chuyển manager hoặc lịch sử hiệu lực.
- Không nhận `employee_id` trong lệnh xác nhận goal; BE lấy Employee từ JWT, không cho xác nhận thay người khác.
- Xóa tài khoản template bị chặn nếu đã có Employee liên kết; có thể vô hiệu hóa tài khoản qua quản trị.

## 7. PostgreSQL / Docker

Máy cần Docker Engine/Compose. Cấu hình và Dockerfile upstream được giữ lại; file `compose.pms.yml` bổ sung migration/bootstrap cho môi trường development.

```bash
python3 scripts/init_env.py
docker compose -f compose.yml -f compose.override.yml -f compose.pms.yml up --build
```

Compose truyền `DATABASE_URL` PostgreSQL cho backend, thay giá trị SQLite trong `.env`. Backend chạy Alembic, tạo admin, seed mẫu rồi phục vụ API và FE đã build. Truy cập [http://localhost:8000](http://localhost:8000). Frontend build dùng API cùng origin; `.env` frontend chỉ cần khi override URL.

Khi dùng PostgreSQL ngoài Docker: đổi `DATABASE_URL` trong `.env`, chạy trong `backend/`:

```bash
uv run --package app alembic upgrade head
uv run --package app python -m app.initial_data
uv run --package app python -m app.pms.bootstrap --demo
```

`--demo` và `compose.pms.yml` dành cho phát triển. Triển khai thật theo tài liệu deployment của template, bỏ dữ liệu demo và thống nhất các quy tắc chưa chốt trước khi dùng chấm điểm nhân sự.

## 8. Kiểm tra chất lượng

```bash
# Từ backend/: kiểm thử PMS trên SQLite in-memory, không dùng DB demo
uv run --package app pytest pms_tests -q
uv run --package app mypy app
uv run --package app ty check --python ../.venv app
uv run --package app ruff check app pms_tests

# Từ frontend/
bun run build
```

Đã kiểm tra khi xây nền tảng:

- 6 kiểm thử tích hợp PMS: phân bổ và snapshot, xác nhận lặp, thiếu/trùng mapping, role/scope, Active/foreign key/code trùng, bảo vệ tài khoản đã liên kết.
- 58 kiểm thử backend của template đã qua trên DB SQLite tạm tách biệt; test private user được sửa để dùng UUID đúng kiểu khi truy vấn.
- TypeScript/production build, mypy, ty và Ruff.
- Migration mới upgrade/downgrade/upgrade và Alembic check không có schema drift trên baseline SQLite; toàn chuỗi migration sinh được PostgreSQL SQL offline.
- Trình duyệt local: đăng nhập admin, dashboard từ API, phân bổ chu kỳ demo; đăng xuất, đăng nhập Employee và xác nhận bộ mục tiêu thành công.

Chưa chạy Docker/PostgreSQL thật trên máy này vì không có Docker; SQL offline không thay thế kiểm thử migration trên PostgreSQL. Chưa chạy toàn bộ Playwright suite gốc của template. Các screen/module bổ sung cần mở rộng test khi triển khai nghiệp vụ tiếp.
