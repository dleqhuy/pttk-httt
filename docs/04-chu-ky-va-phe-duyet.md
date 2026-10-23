# M04 — Chu kỳ đánh giá và phê duyệt cấu hình campus

## 1. Phạm vi

**[BPMN]** Campus HR tạo/clone appraisal cycle, xem thư viện được phát hành, quyết định có cần cấu hình cục bộ không. Nếu có, cấu hình template/rubric và gửi Corporate HR phê duyệt. Nếu không, chuyển thẳng sang áp dụng template cho nhân viên.

## 2. Luồng và nhánh quyết định

| Bước | Chủ thể | Hành vi và kết quả trong BPMN |
|---|---|---|
| 1 | Campus HR | `Activity_0spq6mc`: tạo/clone chu kỳ sau khi thư viện được phát hành |
| 2 | Campus HR | `Activity_0pwn5b8`: xem thư viện template theo chức danh |
| 3 | Campus HR | `Gateway_03zwpjs`: có cần cấu hình cục bộ hoặc sửa sau từ chối? |
| 4a | Campus HR | Nhánh No → gateway gộp → áp dụng template trong M05 |
| 4b | Campus HR | Nhánh Yes → `Activity_1cnlevt`: cấu hình template hoặc rubric |
| 5 | Campus HR | `Activity_12z6lsy`: gửi duyệt |
| 6 | Corporate HR | `Gateway_0taoydb`: quyết định duyệt hoặc từ chối |
| 7a | Corporate HR | `Activity_0o42453`: duyệt → áp dụng template |
| 7b | Corporate HR | `Activity_0lbbssq`: từ chối → quay lại gateway trước bước xem thư viện |

**[Cần chốt]** Hai nhánh duyệt/từ chối không có nhãn điều kiện trong XML; được hiểu theo task đích. Sau từ chối, sơ đồ vẫn cho chọn No ở bước cần cấu hình, tức có thể bỏ thay đổi và dùng bản gốc. Nếu không được phép như vậy, cần điều chỉnh điều kiện trong thiết kế.

## 3. Dữ liệu đề xuất

`AppraisalCycle`: tên/mã, campus hoặc phạm vi, năm/khoảng thời gian, bản thư viện nguồn, tập nhân viên, các mốc đánh giá nếu được duyệt.

`CampusConfigurationVersion`: chu kỳ, template/rubric cơ sở, nội dung điều chỉnh, trạng thái, version.

`ChangeRequest`: version cấu hình được gửi, người gửi, thời điểm, người duyệt, kết quả và lý do. Duyệt một snapshot cụ thể; tránh việc Campus HR sửa nội dung trong lúc người duyệt đang xem rồi dùng kết quả duyệt cho bản khác.

## 4. Trạng thái đề xuất và điều kiện thao tác

Cấu hình: `DRAFT → PENDING_APPROVAL → APPROVED` hoặc `REJECTED → DRAFT`. Trường hợp dùng nguyên thư viện: `USING_PUBLISHED_BASELINE`, không cần một bản ghi duyệt giả.

- Chỉ cấu hình `APPROVED` hoặc baseline được phát hành mới đi sang phân bổ.
- Bản đang chờ duyệt không sửa trực tiếp; rút yêu cầu hoặc tạo revision theo chính sách cần chốt.
- Từ chối cần lý do để Campus HR sửa đúng vấn đề.
- Hai người cùng xử lý một yêu cầu: chỉ quyết định đầu tiên hợp lệ; người sau nhận trạng thái hiện tại.
- Clone chu kỳ chỉ sao chép phần cấu hình được chọn, không sao chép điểm, trao đổi và kết quả công bố của nhân viên.

Tất cả điều kiện kỹ thuật ở trên là **[Đề xuất]**. BPMN không mô tả cơ chế khóa, version hay phạm vi clone.

## 5. Gợi ý FE/BE

FE: danh sách/chi tiết chu kỳ, tạo/clone, so sánh baseline với bản local, form cấu hình, trạng thái và lịch sử yêu cầu; inbox duyệt cho Corporate HR.

BE: quản lý chu kỳ, snapshot cấu hình, tạo yêu cầu duyệt, lệnh approve/reject và kiểm tra quyền/phạm vi. Nhóm API: `appraisal-cycles`, `campus-configurations`, `change-requests`. Không cho client tự gán trạng thái `APPROVED` bằng cập nhật trường thông thường.

## 6. Nghiệm thu và vấn đề mở

Nghiệm thu đề xuất: dùng baseline không bị bắt gửi duyệt; cấu hình đã sửa phải được duyệt trước khi gán; từ chối giữ lý do và version; yêu cầu đã xử lý không được duyệt lần hai.

Cần chốt: chu kỳ do mỗi campus tạo riêng hay cùng thuộc một chương trình toàn công ty; ngày mở/đóng; tập nhân viên; phạm vi clone; người có quyền mở lại; có cho hủy thay đổi bị từ chối và dùng baseline không.
