# M05 — Phân bổ và xác nhận mục tiêu

## 1. Mục đích

**[BPMN]** Sau khi cấu hình đủ điều kiện, Campus HR áp dụng thư viện cho nhân viên; hệ thống tự động gán goal, kiểm tra kết quả, xử lý trùng hoặc thiếu template rồi thông báo nhân viên. Nhân viên chọn chu kỳ, xem goal và rubric từng KPI, sau đó `Submit Goal`.

## 2. Luồng phân bổ và ba nhánh

1. `Activity_0kqtll8`: áp dụng thư viện cho nhân viên.
2. `Activity_1pw9aqx`: tự động gán goal; có annotation Automation.
3. `Gateway_1w2g6kz`: kiểm tra goal đã gán.

| Nhánh BPMN | Đường xử lý |
|---|---|
| Không trùng template, toàn bộ nhân viên được gán | Qua `Gateway_1pl3rx2` → thông báo nhân viên |
| Nhân viên bị gán trùng template | `Activity_12w0foa`: Campus HR gán lại thủ công → gateway gộp → thông báo |
| Không có template được gán cho nhân viên | `Activity_1h1vl8p`: thông báo Corporate HR → quay lại tạo master data |

Nhãn nhánh thiếu là `No Template assigned for any Employee`; mô tả loop yêu cầu thêm designation chưa được mapping để đảm bảo coverage. **[Cần chốt]** Điều kiện là “ít nhất một người thiếu” hay “tất cả đều thiếu”? Tạm đề xuất kiểm tra mọi nhân viên thuộc phạm vi và báo danh sách người thiếu; đây là suy luận từ mục tiêu coverage, không phải biểu thức có sẵn trong XML.

## 3. Các vấn đề logic cần xử lý khi triển khai

- **[BPMN]** Nhánh gán lại thủ công đi thẳng tới thông báo, không quay về gateway kiểm tra. **[Đề xuất]** Kiểm tra lại coverage và trùng trước khi xác nhận hoàn tất gán lại.
- **[BPMN]** Nhánh thiếu đi qua tạo KRA/KPI, tạo template, phát hành rồi task tạo/clone chu kỳ. **[Cần chốt]** Có thực sự tạo chu kỳ mới không? **[Đề xuất]** Duy trì chu kỳ đang xử lý, cập nhật bản cấu hình được duyệt và chạy lại cho phần bị lỗi; không tự tạo chu kỳ trùng hoặc xóa goal đã xác nhận.
- Nếu trong cùng một đợt có cả thiếu và trùng, exclusive gateway không mô tả thứ tự ưu tiên. **[Đề xuất]** Trả về một báo cáo chứa cả hai loại lỗi và chỉ hoàn tất sau khi tất cả đã xử lý.

## 4. Luồng nhân viên

`Activity_02vft5k` chọn chu kỳ hiện tại → `Activity_08ley76` xem goal → `Activity_022rxwr` xem rubric từng KPI → `Activity_1gqvi4y` submit goal → tự đánh giá giữa năm.

**[BPMN]** Không có task nhân viên tự tạo/sửa goal, quản lý duyệt goal hoặc từ chối goal. **[Đề xuất]** Diễn giải `Submit Goal` là xác nhận bộ mục tiêu được giao; nếu muốn goal setting hai chiều phải bổ sung nghiệp vụ riêng.

## 5. Dữ liệu và quy tắc đề xuất

`AssignmentRun`: chu kỳ, bản cấu hình, người khởi tạo, trạng thái, thống kê và danh sách lỗi.

`GoalSet`: nhân viên trong chu kỳ, template version được chọn, revision, trạng thái. `GoalItem`: KPI/rubric snapshot, target/weight nếu có, nguồn template.

- Khóa nghiệp vụ gợi ý: một bộ goal hiệu lực cho một nhân viên trong một chu kỳ, có nhiều revision lịch sử nếu cần. Đây là giả định cần xác nhận từ nhánh “Duplicate Template”.
- Gán lại hoặc chạy lại cùng request không tạo thêm bộ goal trùng.
- Chưa đủ coverage thì hiển thị đợt phân bổ chưa hoàn tất. Chính sách cho phép người đã được gán bắt đầu đánh giá sớm hay phải chờ tất cả cần chốt.
- Goal đã submit cần bị khóa sửa hoặc đi qua quy trình revision; BPMN chưa mô tả mở lại.
- Không gửi thông báo “đã có mục tiêu” cho hồ sơ chưa có bộ goal hợp lệ.

## 6. Gợi ý FE/BE

FE Campus HR: preview phân bổ, thống kê đủ/thiếu/trùng, danh sách lỗi theo designation, gán lại, lịch sử đợt chạy. FE Employee: chọn chu kỳ, goal và rubric, hành động submit với xác nhận nội dung.

BE: resolve mapping, chạy phân bổ theo batch nếu cần, kiểm tra coverage, gán lại và submit goal theo transaction/version. Nhóm API: `assignment-runs`, `assignment-issues`, `goal-sets`, hành động `reassign` và `submit`.

## 7. Nghiệm thu đề xuất

Một nhân viên không bị tạo hai bộ goal hiệu lực khi bấm chạy lại; lỗi thiếu designation được phân biệt với thiếu mapping; gán lại vẫn lỗi thì không báo thành công; nhân viên xem đúng rubric đã gán; submit goal lặp lại không tạo hai hồ sơ đánh giá.
