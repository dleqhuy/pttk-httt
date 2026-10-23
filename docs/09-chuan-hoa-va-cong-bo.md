# M09 — Chuẩn hóa và công bố kết quả

## 1. Phạm vi

**[BPMN]** Corporate HR xem điểm trước chuẩn hóa → chọn scale up hoặc scale down → tính lại → xem kết quả → quyết định hài lòng hay lặp tiếp → công bố điểm và feedback → Employee xem → end event.

Không có căn cứ để hiểu normalization là bell curve, z-score, xếp hạng theo quota hay áp đặt phân phối. Nguồn chỉ ghi scale up/down và re-calculate.

## 2. Luồng chi tiết

| Bước | Node BPMN | Ý nghĩa |
|---|---|---|
| Xem điểm gốc | `Activity_0rq72q6` | Nhận kết quả sau tính pre-normalization |
| Chọn hướng | `Gateway_0a55y07` | Đi đến scale up hoặc scale down |
| Tăng / giảm | `Activity_0t9khwd` / `Activity_12c5mcr` | Thực hiện điều chỉnh |
| Tính lại | `Activity_07nnoe1` | Có annotation Automation |
| Xem lại | `Activity_03djxoo` | Corporate HR xem điểm đã tính lại |
| Quyết định | `Gateway_1crydfc` | Chưa hài lòng quay về `Gateway_04u7w77`; hài lòng đi công bố |
| Công bố | `Activity_11mn5uh` | Publish Final Rating Score & Feedback for Employee |
| Xem kết quả | `Activity_10drbxx` | Employee xem điểm và feedback cuối cùng |
| Kết thúc | `Event_0yoqgni` | Kết thúc đường đi được mô hình hóa |

Các flow ở gateway chọn hướng và gateway hài lòng không có nhãn điều kiện XML. Ý nghĩa tăng/giảm suy ra từ task đích; nhánh lặp có mô tả Corporate HR làm lại đến khi hài lòng.

## 3. Điểm thiếu trong mô hình

1. **Không có nhánh giữ nguyên/bỏ qua chuẩn hóa.** Theo đường đi hiện tại phải scale ít nhất một lần trước công bố. **[Cần chốt]** Có cần nhánh “giữ nguyên” không? Không tự coi scale bằng 0 là quy tắc có sẵn.
2. **Không có tham số scale.** Tăng/giảm theo điểm cộng, hệ số hay target? Áp dụng từng người, nhóm, campus hay toàn chu kỳ?
3. **Không có điểm chờ đủ dữ liệu tập thể.** Có thể nhận thông báo sau từng manager submission. Chuẩn hóa có đợi toàn bộ nhân viên hoặc một cohort không?
4. **Không có tác vụ soạn feedback cuối cùng.** Task công bố có nhắc feedback nhưng nguồn feedback được chọn/lấy từ đâu chưa rõ.
5. **Không có reopen/thu hồi công bố hay khiếu nại sau công bố.** Nếu cần phải bổ sung nghiệp vụ.

## 4. Thiết kế phiên chuẩn hóa đề xuất

`NormalizationSession`: chu kỳ, phạm vi/tập hồ sơ, tập raw score version, trạng thái, người phụ trách. `NormalizationIteration`: thứ tự lần thử, direction, tham số, baseline tham chiếu, lý do, kết quả và người thực hiện. `FinalPublication`: version công bố, kết quả đã chốt, feedback cuối, thời điểm và người công bố.

Luồng ứng dụng gợi ý: chốt tập hồ sơ → xem raw score → nhập cách điều chỉnh và lý do → preview tính lại → lặp nếu cần → chọn iteration được duyệt → công bố snapshot nguyên tử.

**[Cần chốt]** Mỗi lần lặp tính từ raw score hay kết quả vòng trước? Hai cách tạo kết quả khác nhau. **[Đề xuất]** Tính mỗi preview từ raw baseline cố định với bộ tham số rõ ràng để tránh cộng dồn vô tình; nếu nghiệp vụ muốn cộng dồn phải lưu chuỗi và hiển thị tác động từng bước.

## 5. Quy tắc đề xuất

- Raw score giữ nguyên để đối chiếu; final score nằm trong version khác.
- Giới hạn điểm phải thống nhất với thang chính thức; không tự cắt trần/sàn nếu chưa có quy tắc.
- Chặn công bố khi có hồ sơ trong phạm vi chưa tính xong hoặc lỗi, trừ chính sách công bố từng phần được duyệt.
- Bản draft/preview chỉ hiển thị cho người được cấp quyền. Employee đọc bản `PUBLISHED` của chính mình.
- Công bố lặp cùng version không tạo hai kết quả chính thức hoặc gửi trùng thông báo.
- Không tự chỉnh final score đã công bố khi nguồn achievement hoặc rubric cập nhật.

## 6. Gợi ý FE/BE

FE Corporate HR: danh sách đủ/chưa đủ điểm, so sánh raw/preview/final, nhập tham số, lịch sử iteration, chọn feedback công bố và kiểm tra trước publish. FE Employee: điểm cuối cùng, feedback được phép xem và thông tin chu kỳ.

BE: kiểm tra readiness và scope, engine điều chỉnh theo chính sách được chốt, lưu iteration, lệnh publish, quyền đọc kết quả. Nhóm API: `normalization-sessions`, `normalization-iterations`, `final-publications`, `my-final-results`.

## 7. Nghiệm thu đề xuất

Cả scale up/down đều tính lại rồi cho review; lặp không làm mất raw score; Employee không thấy preview; publish dùng đúng iteration đã chọn; phiên tính còn lỗi không được công bố; thay đổi dữ liệu sau publish không âm thầm đổi kết quả Employee đang thấy.
