# PMS — Phân tích nghiệp vụ từ BPMN

Bộ tài liệu phân tích quy trình quản lý và đánh giá hiệu suất nhân sự, làm đầu vào để thiết kế FE, BE và cơ sở dữ liệu.

**Nguồn:** [PMS_Đồ án cuối kỳ_Final Ver.bpmn](<PMS_Đồ án cuối kỳ_Final Ver.bpmn>). Tên file trên đĩa sử dụng Unicode dạng tổ hợp; giữ nguyên file gốc để đối chiếu.

## Quy trình tổng quát

Corporate HR tạo thư viện KRA/KPI, template theo chức danh và rubric → Campus HR tạo chu kỳ, điều chỉnh và xin duyệt nếu cần → hệ thống phân bổ mục tiêu → nhân viên và quản lý đánh giá giữa năm → đánh giá cuối năm → tính điểm trước chuẩn hóa → Corporate HR chuẩn hóa và công bố → nhân viên xem kết quả.

## Các module

| Mã | Module / tài liệu | Nội dung chính |
|---|---|---|
| M01 | [Tổ chức, nhân sự và phân quyền](docs/01-to-chuc-nhan-su-phan-quyen.md) | 4 vai trò, campus, chức danh, quan hệ quản lý; module nền tảng suy ra từ BPMN |
| M02 | [Thư viện KRA/KPI](docs/02-thu-vien-kra-kpi.md) | Danh mục tiêu chí, trạng thái Active, dữ liệu dùng tạo template |
| M03 | [Template và rubric](docs/03-template-va-rubric.md) | Template theo chức danh, rubric mặc định/tùy chỉnh, phát hành thư viện |
| M04 | [Chu kỳ và phê duyệt cấu hình](docs/04-chu-ky-va-phe-duyet.md) | Tạo/clone chu kỳ, cấu hình campus, gửi duyệt, từ chối và sửa lại |
| M05 | [Phân bổ và xác nhận mục tiêu](docs/05-phan-bo-muc-tieu.md) | Gán tự động, phát hiện trùng/thiếu, gán lại, nhân viên submit goal |
| M06 | [Đánh giá giữa năm](docs/06-danh-gia-giua-nam.md) | Tự đánh giá, hai vòng trao đổi, quản lý chấm điểm giữa năm |
| M07 | [Đánh giá cuối năm](docs/07-danh-gia-cuoi-nam.md) | Tự đánh giá cuối năm, feedback quản lý, achievement và rubric |
| M08 | [Achievement và tính điểm](docs/08-achievement-va-tinh-diem.md) | Nguồn dữ liệu thủ công/tự động, điểm trước chuẩn hóa, phiên bản tính |
| M09 | [Chuẩn hóa và công bố](docs/09-chuan-hoa-va-cong-bo.md) | Scale up/down, tính lại, lặp chuẩn hóa, công bố kết quả |
| M10 | [Thông báo và lịch sử](docs/10-thong-bao-va-lich-su.md) | Các điểm thông báo trong BPMN; đề xuất retry, audit và chống gửi trùng |

## Tài liệu dùng chung

| File | Dùng để làm gì |
|---|---|
| [00 — Tổng quan](docs/00-tong-quan.md) | Phạm vi, thuật ngữ, cách đọc tài liệu, sơ đồ toàn trình và ranh giới module |
| [11 — Mô hình dữ liệu](docs/11-mo-hinh-du-lieu.md) | Entity, quan hệ, khóa nghiệp vụ, phiên bản và ranh giới transaction đề xuất |
| [12 — Trạng thái và quyền](docs/12-trang-thai-va-quyen.md) | Chuyển trạng thái, kiểm tra quyền, quy tắc bất biến và tình huống nghiệm thu |
| [13 — Khoảng trống và kế hoạch FE/BE](docs/13-khoang-trong-va-ke-hoach.md) | Điểm chưa rõ của sơ đồ, các quyết định cần chốt, thứ tự phát triển |
| [14 — Đối chiếu BPMN](docs/14-doi-chieu-bpmn.md) | Danh sách đủ task, gateway, flow, lane và annotation theo ID gốc |

**Thứ tự đọc:** `00` → các module `01–10` → `11` và `12` → chốt các câu hỏi trong `13`. Dùng `14` để kiểm tra lại đường đi trong sơ đồ.

## Quy ước quan trọng

- **[BPMN]**: được thể hiện trực tiếp bằng node, nhánh hoặc annotation trong file nguồn.
- **[Đề xuất]**: thiết kế nghiệp vụ/kỹ thuật để có thể triển khai FE/BE; chưa phải yêu cầu đã được xác nhận.
- **[Cần chốt]**: nguồn chưa đủ thông tin hoặc có cách hiểu khác nhau; không tự coi là quy tắc đã duyệt.

Các màn hình, entity, trạng thái và nhóm API trong tài liệu là gợi ý phân tích, chưa ràng buộc framework hay hợp đồng API. Việc tách 10 module là cách tổ chức hệ thống được đề xuất; BPMN không định nghĩa sẵn ranh giới module. Không mặc định phải tách thành 10 service.
