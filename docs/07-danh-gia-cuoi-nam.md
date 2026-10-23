# M07 — Đánh giá cuối năm (Year-End Review)

## 1. Điều kiện bắt đầu

**[BPMN]** Sau khi kết thúc trao đổi về manager rating giữa năm, luồng hợp ở `Gateway_1adm9if` rồi đi đến `Activity_1jwk2on` — Employee `Conduct Self-rating`, được chú thích `Year-End Review`.

**[Cần chốt]** Không có timer, ngày mở hoặc task HR kích hoạt. Trên hệ thống thực tế nên có mốc mở kỳ cuối năm nếu quy trình diễn ra theo năm; đó là quy tắc bổ sung, không phải bước đã có trong BPMN.

## 2. Luồng tự đánh giá và feedback

1. Employee tự đánh giá cuối năm (`Activity_1jwk2on`).
2. Submit (`Activity_03j1p16`).
3. Thông báo Manager (`Activity_0lszlxa`, annotation Automation).
4. Manager xem self-rating (`Activity_17fp1mz`).
5. Tại `Gateway_0dwkatr`, Manager chọn có feedback hay không.
6. Nếu Yes: `Activity_0kcts77` cung cấp feedback; nếu No bỏ qua. Hai nhánh gộp tại `Gateway_0ucdgtr`.
7. Manager chuyển sang chấm goal cuối năm (`Activity_0z3r871`, annotation Year-End Review).

**[BPMN]** Feedback cuối năm chỉ là một bước tùy chọn của Manager. Không có task Employee nhận/trả lời, không có thông báo tương ứng và không có vòng lặp như giữa năm. Không tái sử dụng tự động luồng trao đổi M06 cho M07 nếu chưa bổ sung yêu cầu.

## 3. Luồng Manager rating cuối năm

Sau `Rate Employee Goal`, gateway `Gateway_07t4291` chọn nguồn rating data:

| Nhánh | Hành vi trong nguồn |
|---|---|
| Manual Input | Manager nhập achievement tại `Activity_098w8bk` |
| Automation Input | Đi thẳng tới gateway gộp; không có task fetch/sync achievement riêng |

Hai nhánh gộp tại `Gateway_1yo2ofi` → Manager `Rate score based on associated Rubric` (`Activity_1egz21e`) → `Submit Manager Rating` (`Activity_0nibfz6`) → M08 tính điểm trước chuẩn hóa.

**[BPMN]** Dù achievement đến tự động, vẫn có task Manager chấm điểm theo rubric. Không có căn cứ để tự thay task này bằng thuật toán chấm hoàn toàn tự động.

## 4. Dữ liệu và ràng buộc đề xuất

- Tạo `ReviewRound(kind=YEAR_END)` riêng với giữa năm; không ghi đè điểm cũ.
- Liên kết goal set hoặc revision dùng cho cuối năm. **[Cần chốt]** Có thay đổi goal giữa hai kỳ không? BPMN không có bước giao lại goal.
- Lưu self-rating cuối năm, feedback của Manager và manager rating cuối năm riêng biệt.
- Mỗi achievement có nguồn `MANUAL`/`AUTOMATED`, giá trị/đơn vị nếu có, nguồn tham chiếu, thời điểm lấy và người xác nhận.
- Mỗi rating item tham chiếu rubric version đã gán; xác minh điểm thuộc thang cho phép.
- Khóa bản submit, chỉ mở lại theo chính sách đã chốt; draft có thể sửa trước submit.

Trạng thái đề xuất: `SELF_DRAFT → SELF_SUBMITTED → MANAGER_REVIEW → MANAGER_DRAFT → MANAGER_SUBMITTED`. Feedback tùy chọn không có trạng thái chờ Employee trả lời theo nguồn hiện tại.

## 5. Ngoại lệ cần thiết kế

Nếu nhánh tự động chưa có dữ liệu, **[Đề xuất]** hiện trạng thái thiếu/chưa đồng bộ và chặn submit khi achievement là bắt buộc. Không thay dữ liệu thiếu bằng 0. Cho chuyển qua nhập thủ công hay không cần chính sách rõ.

Nếu đổi nguồn achievement sau khi đã chấm, **[Đề xuất]** yêu cầu xem lại rating bị ảnh hưởng trước submit. Nếu dữ liệu thay đổi sau submit, tạo revision; không tự làm thay đổi điểm đã công bố.

## 6. Gợi ý FE/BE

FE: form self-rating cuối năm; màn hình manager xem tự đánh giá và feedback tùy chọn; bộ nhập achievement có chỉ báo nguồn; xem rubric cùng lúc chấm điểm; kiểm tra thiếu dữ liệu trước submit.

BE: lưu/submit self-rating cuối năm, feedback một chiều theo nguồn, quản lý achievement, lưu/submit manager rating, yêu cầu tính điểm. Nhóm API có thể dùng chung M06 nhưng luôn xác định `roundId` và `roundKind`; không chỉ dùng `employeeId` để tìm bản đánh giá.

## 7. Nghiệm thu đề xuất

Feedback Yes và No đều đến bước manager rating; nhánh tự động không đòi nhập lại thủ công nếu dữ liệu hợp lệ; manager rating giữa năm không bị ghi đè; điểm ngoài rubric bị từ chối tại BE; dữ liệu thiếu được hiển thị đúng, không âm thầm đưa 0 vào tính điểm.
