# M10 — Thông báo và lịch sử nghiệp vụ

## 1. Phạm vi và căn cứ

**[BPMN]** Có nhiều task Notify để chuyển lượt xử lý. **[Đề xuất]** Tách năng lực thông báo dùng chung và audit để truy vết các thao tác ảnh hưởng cấu hình/điểm. Audit không có task riêng trong nguồn; đây là phần bổ sung phục vụ tính nhất quán và giải thích kết quả.

## 2. Các điểm Notify có trong BPMN

| Trigger / ngữ cảnh | Node Notify | Người nhận |
|---|---|---|
| Phân bổ goal hợp lệ | `Activity_0s4afhd` | Employee |
| Thiếu mapping template | `Activity_1h1vl8p` | Corporate HR |
| Submit self-rating giữa năm | `Activity_1rtms55` | Manager |
| Manager comment self-rating giữa năm | `Activity_1ddd548` | Employee |
| Employee trả lời comment self-rating | `Activity_1o42ms8` | Manager |
| Submit manager rating giữa năm | `Activity_1arvgb4` | Employee |
| Employee comment manager rating giữa năm | `Activity_0zactp8` | Manager |
| Manager trả lời comment manager rating | `Activity_1sgv8ot` | Employee |
| Submit self-rating cuối năm | `Activity_0lszlxa` | Manager |
| Tính xong điểm trước chuẩn hóa | `Activity_1bi5h1k` | Corporate HR |

Có 10 task Notify. Chín task có annotation Automation; riêng `Activity_1o42ms8` không có annotation đó, dù tên cũng là Notify to Manager. **[Đề xuất]** Tự động hóa cả mười; không trình bày đây là kiểu `serviceTask` sẵn có trong XML.

Thông báo khi gửi duyệt, khi approve/reject, nhắc hạn và khi công bố là **[Đề xuất]** bổ sung; BPMN không có task Notify riêng cho các tình huống này. Việc Employee xem final result sau publish là một sequence flow, không xác định kênh gửi.

## 3. Cơ chế đề xuất

1. Hành động nghiệp vụ lưu thành công cùng một event trong transaction/outbox.
2. Worker đọc event, xác định người nhận từ hồ sơ chu kỳ và quyền hiện tại theo chính sách.
3. Tạo notification chứa loại sự kiện, chu kỳ, hồ sơ/vòng đánh giá và liên kết đến màn hình.
4. Gửi qua kênh đã chốt; lưu trạng thái và retry khi lỗi.
5. Dùng khóa event + recipient + channel để chống gửi trùng khi xử lý lại.

Kênh in-app/email/push chưa được nguồn chỉ định. Không tự đồng nhất task Notify với gửi email.

## 4. Quy tắc và bảo mật đề xuất

- Lỗi gửi thông báo không làm mất bản đánh giá đã submit. Hiển thị trạng thái gửi lỗi để vận hành xử lý.
- Đường dẫn thông báo vẫn phải kiểm tra quyền khi mở; không dùng link để bỏ qua phân quyền.
- Không đưa điểm/feedback nhạy cảm vào email hoặc log mặc định; ưu tiên nội dung tóm tắt và link yêu cầu đăng nhập.
- Đọc thông báo khác với hoàn thành nhiệm vụ. Cần lưu trạng thái task/feedback riêng; không tự chọn nhánh No khi người nhận đã đọc.
- Nếu manager thay đổi, cần chính sách chuyển nhiệm vụ và người nhận; không tự gửi tới mọi manager lịch sử.

## 5. Audit đề xuất

Ghi sự kiện thay đổi thư viện, rubric, cấu hình, yêu cầu duyệt, gán/gán lại goal, submit, mở/đóng trao đổi, tính điểm, scale và publish. Mỗi sự kiện có actor, action, target, thời điểm, revision trước/sau hoặc diff, lý do khi cần và correlation ID.

Audit theo kiểu ghi thêm, không cho người dùng sửa lịch sử qua API thông thường. Chỉ lưu dữ liệu cần thiết; không ghi token, mật khẩu hay payload tích hợp nhạy cảm.

## 6. Gợi ý FE/BE và nghiệm thu

FE: notification center, liên kết tới tác vụ cụ thể, trạng thái chưa đọc; lịch sử trên trang chi tiết có lọc theo quyền. BE: outbox/event dispatcher, delivery adapter, retry và audit query. Nhóm API: `notifications`, `notification-preferences` nếu có nhu cầu, `audit-events` theo phạm vi.

Nghiệm thu đề xuất: retry không tạo trùng notification; người không có quyền không mở được hồ sơ qua link; submit thành công vẫn còn nguyên khi email lỗi; có thể đối chiếu ai đã thay rubric, gán lại template hoặc công bố iteration nào.
