# M01 — Tổ chức, nhân sự và phân quyền

## 1. Mục đích và mức độ căn cứ

**[BPMN]** Có bốn lane: `CORPORATE HR / HRBP`, `CAMPUS HR / HRBP`, `L1 MANAGER`, `EMPLOYEE`. Template dựa trên designation; việc gán mục tiêu cần bao phủ nhân viên.

**[Đề xuất]** Tách module nền tảng để cung cấp danh sách nhân viên, chức danh, campus và quan hệ quản lý. Không có task tạo tài khoản, tạo chức danh hay phân quyền trong BPMN, vì vậy toàn bộ luồng quản trị dữ liệu nền dưới đây là thiết kế bổ sung.

## 2. Trách nhiệm

| Vai trò | Quyền nghiệp vụ theo lane | Phạm vi đề xuất |
|---|---|---|
| Corporate HR | Tạo thư viện, rubric; duyệt cấu hình; chuẩn hóa và công bố | Phạm vi công ty được cấp |
| Campus HR | Tạo/clone chu kỳ; cấu hình; gán lại mục tiêu | Campus được cấp |
| L1 Manager | Xem self-rating, feedback, chấm nhân viên | Nhân viên thuộc quan hệ quản lý hợp lệ |
| Employee | Xem mục tiêu/rubric, tự đánh giá, trao đổi, xem kết quả | Hồ sơ của chính mình |

**[Cần chốt]** Corporate HR có xem mọi self-rating không? Campus HR có được xem điểm trước/sau chuẩn hóa không? Lane chỉ thể hiện người thực hiện task, không tự động cấp quyền đọc tất cả dữ liệu cho HR.

## 3. Dữ liệu và logic đề xuất

- `Employee`: mã nhân viên duy nhất, tên hiển thị, trạng thái làm việc, campus và designation hiện hành.
- `Campus`, `Designation`: mã, tên, trạng thái; designation là dữ liệu ánh xạ template.
- `ManagerAssignment`: employee, manager, thời gian hiệu lực; không cho nhân viên tự quản lý chính mình.
- `RoleAssignment`: người dùng, vai trò và phạm vi. Một người có thể vừa là Employee vừa là Manager; giao diện cho chọn ngữ cảnh khi cần.
- `AppraisalParticipant`: lưu campus, designation và manager được chốt cho nhân viên trong chu kỳ, để thay đổi nhân sự sau này không tự làm đổi hồ sơ cũ.

Luồng chuẩn bị: lấy dữ liệu nhân sự → kiểm tra mã trùng và quan hệ → cấp vai trò/phạm vi → tạo tập đối tượng của chu kỳ → kiểm tra đủ designation và manager → cho phép phân bổ mục tiêu.

## 4. Ràng buộc và ngoại lệ

**[Đề xuất]** BE kiểm tra cả vai trò, phạm vi đối tượng và trạng thái nghiệp vụ trên từng thao tác; việc FE ẩn nút không thay thế kiểm tra quyền. Employee không đọc điểm chưa công bố của người khác bằng cách đổi ID trên URL.

Nhân viên thiếu chức danh phải hiện thành lỗi dữ liệu nền, phân biệt với chức danh hợp lệ nhưng chưa có template. Nhân viên chưa có quản lý phải xuất hiện trong danh sách cần xử lý trước bước giao đánh giá cho quản lý.

**[Cần chốt]** Quy tắc nghỉ việc, chuyển campus, đổi manager giữa chu kỳ, kiêm nhiệm nhiều chức danh và ủy quyền. Chưa mặc định tự chuyển hồ sơ đánh giá khi thông tin nhân sự thay đổi.

## 5. Gợi ý FE/BE

| FE | Trách nhiệm BE tương ứng |
|---|---|
| Danh sách nhân sự, lọc campus/chức danh | Truy vấn theo phạm vi, dữ liệu định danh nhất quán |
| Chi tiết nhân viên và quản lý | Kiểm tra quan hệ và thời gian hiệu lực |
| Cấu hình vai trò/phạm vi nếu thuộc MVP | Chính sách cấp quyền, chống tự nâng quyền |
| Danh sách nhân viên trong chu kỳ | Snapshot và kiểm tra điều kiện tham gia |

Nhóm API đề xuất: `employees`, `campuses`, `designations`, `manager-assignments`, `role-assignments`, `cycle-participants`. Cách đăng nhập và nguồn nhân sự cần chốt trước khi cụ thể hóa endpoint.

## 6. Tiêu chí nghiệm thu đề xuất

1. Employee A không xem hoặc submit hồ sơ của B.
2. Manager chỉ thao tác đúng danh sách nhân viên được phân công trong chu kỳ.
3. Campus HR không chỉnh cấu hình của campus ngoài phạm vi.
4. Đổi designation hiện tại không tự làm đổi template đã chốt của chu kỳ cũ.

## 7. Đối chiếu nguồn

Bốn lane trong file; task dùng designation `Activity_0bnucj2`; tác vụ áp dụng cho nhân viên `Activity_0kqtll8`. Không có node riêng cho module quản trị định danh.
