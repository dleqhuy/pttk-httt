# 13 — Khoảng trống BPMN và kế hoạch làm FE/BE

## 1. Các quyết định cần chốt

| Mã | Vấn đề đọc được từ nguồn | Tác động | Hướng xử lý đề xuất để thảo luận |
|---|---|---|---|
| Q01 | Không có công thức tổng điểm, weight, rounding, N/A | Không thể chốt engine tính và kết quả mẫu | Viết bảng quy tắc tính, thang điểm, ví dụ chuẩn do nghiệp vụ duyệt |
| Q02 | Scale up/down không có tham số, phạm vi hoặc baseline mỗi lần lặp | Không thể chốt form chuẩn hóa và thuật toán | Chọn cộng điểm/hệ số/phương pháp; xác định cohort, giới hạn và cách lặp |
| Q03 | Không có nhánh giữ nguyên raw score trước publish | Có thể buộc sửa điểm dù không cần | Bổ sung đường “Không điều chỉnh” nếu nghiệp vụ cho phép |
| Q04 | Không có ngày mở/đóng giữa năm, cuối năm hoặc timer chờ | Luồng hiện tại đi ngay từ giữa năm sang cuối năm | Chốt lịch hoặc thao tác HR mở kỳ; quy tắc quá hạn |
| Q05 | “Role Based” và “Designation Based” dùng lẫn | Mapping dễ nhầm role phân quyền với chức danh | Chuẩn hóa template theo designation nếu đó là ý định nghiệp vụ |
| Q06 | Mapping có nhánh trùng và thiếu nhưng không có ưu tiên khi cùng xảy ra | Batch phân bổ có thể báo hoàn tất sai | Báo cả hai loại; xử lý đến đủ coverage |
| Q07 | Nhánh gán lại không trở về check | Có thể thông báo khi lỗi còn tồn tại | Validate lại trước hoàn tất gán thủ công |
| Q08 | Loop thiếu mapping đi qua cả tạo/clone chu kỳ | Có nguy cơ tạo chu kỳ mới hoặc mất dữ liệu đang chạy | Làm rõ resume chu kỳ cũ và version cấu hình được dùng |
| Q09 | Nhãn thiếu template có thể hiểu “bất kỳ” hoặc “tất cả” | Khác điều kiện coverage | Chốt kiểm tra thiếu trên mỗi participant, tạm đề xuất phát hiện ít nhất một người thiếu |
| Q10 | Loop nói “cả hai hài lòng”, nhưng một nhánh No đã cho đi tiếp | Trạng thái đồng thuận dễ thiết kế sai | Chọn bám nhánh hiện có hoặc bổ sung hai xác nhận |
| Q11 | Feedback giữa năm không quay về sửa rating | Không rõ có cho sửa điểm sau submit | Mặc định khóa bản submit; muốn sửa cần luồng revision được duyệt |
| Q12 | Feedback cuối năm một chiều, không có vòng Employee phản hồi | Không thể mặc định dùng nguyên quy trình giữa năm | Xác nhận khác biệt là có chủ ý hay cần thêm vòng |
| Q13 | Automation Input không có nguồn hay task đồng bộ | Chưa thiết kế được tích hợp thật | Chốt nguồn, khóa đối soát, kỳ dữ liệu, lịch sync và fallback |
| Q14 | Tính điểm xong là notify HR; không có barrier chờ đủ người | Không rõ readiness để chuẩn hóa tập thể | Xác định tính/công bố theo người, nhóm, campus hay cả chu kỳ |
| Q15 | Publish có feedback nhưng thiếu bước tạo/chọn feedback | Không rõ final feedback lấy từ đâu | Thêm nội dung final feedback hoặc chọn nguồn feedback được công bố |
| Q16 | Không có quyền chi tiết, thay manager, nghỉ việc, ủy quyền | Rủi ro sai đối tượng và scope | Chốt ma trận quyền và snapshot quan hệ trong chu kỳ |
| Q17 | Không có reopen/thu hồi công bố/khiếu nại | Không rõ xử lý sai sau submit/publish | Chọn khóa hoàn toàn hoặc thiết kế quy trình sửa và công bố lại |
| Q18 | Không định nghĩa một hồ sơ hay nhiều hồ sơ/nhân viên/chu kỳ | Ảnh hưởng khóa dữ liệu và mapping | Chốt cardinality trước migration DB |

Q01–Q04, Q13–Q14 cần chốt trước khi hoàn thiện phần điểm và chuẩn hóa. Q05–Q09, Q16, Q18 cần chốt trước schema và phân bổ mục tiêu. Các điểm còn lại cần chốt trước triển khai workflow đánh giá/công bố.

## 2. Hạn chế kỹ thuật của file BPMN

**[BPMN]** `isExecutable=false`; không có condition expression hoặc default flow trên các gateway; các task được khai báo generic. Các nhãn mang ý nghĩa nghiệp vụ nhưng chưa đủ làm điều kiện chạy tự động.

Không có parallel/multi-instance hay subprocess cho từng nhân viên. Không có task quản trị danh mục nhân sự, error/boundary event, timeout hoặc escalation. 16 annotation và các association cung cấp ý nghĩa bổ sung; chúng không tự thực thi logic.

Các điểm trên chưa đủ để kết luận XML hỏng. Chúng cho thấy cần đặc tả thêm nếu muốn dùng workflow engine. Có thể xây ứng dụng bằng state machine trong BE mà không cần BPMN engine; lựa chọn kiến trúc chưa bị ràng buộc bởi file này.

## 3. Trình tự phát triển đề xuất

| Giai đoạn | Phạm vi | Đầu ra có thể kiểm tra |
|---|---|---|
| 0. Chốt nghiệp vụ | Cardinality, quyền, rubric, tính điểm, chuẩn hóa, kỳ đánh giá | Bộ câu trả lời Q01–Q18 và ví dụ tính điểm đã duyệt |
| 1. Nền tảng và cấu hình | M01–M04 | Nhân sự mẫu, thư viện Active, template/rubric version, chu kỳ và duyệt local |
| 2. Phân bổ | M05 | Chạy đúng ba nhóm đủ/thiếu/trùng, Employee submit goal |
| 3. Giữa năm | M06 + thông báo thiết yếu M10 | Đi được cả hai vòng feedback, điểm giữa năm tách biệt |
| 4. Cuối năm và điểm | M07–M08 | Achievement có nguồn, chấm theo rubric, raw score giải thích được |
| 5. Chuẩn hóa và công bố | M09 | Preview/iteration, publish snapshot, Employee xem đúng quyền |
| 6. Hoàn thiện vận hành | M10 và kiểm tra xuyên suốt | Retry, audit, phân quyền, concurrency và các case lỗi |

Thông báo/audit nên có hạ tầng tối thiểu từ sớm và được bổ sung theo từng giai đoạn; không đợi cuối mới thêm kiểm tra quyền hay lịch sử các thao tác ảnh hưởng điểm.

## 4. Danh sách nhóm màn hình để lên FE

| Nhóm | Các màn hình chính đề xuất |
|---|---|
| Corporate HR | KRA/KPI; template/rubric; mapping designation; phát hành; inbox duyệt; raw score; chuẩn hóa; công bố |
| Campus HR | Chu kỳ/tạo clone; cấu hình local; lịch sử yêu cầu; phân bổ; lỗi thiếu/trùng; gán lại |
| Manager | Danh sách nhân viên theo chu kỳ; self-rating; feedback; manager rating giữa năm; achievement và rating cuối năm |
| Employee | Chọn chu kỳ; mục tiêu/rubric; submit goal; self-rating giữa/cuối năm; trao đổi giữa năm; final result |
| Dùng chung | Đăng nhập theo phương thức được chốt; chọn vai trò; notification; lịch sử và thông báo lỗi đúng phạm vi |

**[Đề xuất]** Lên wireframe cho một luồng xuyên suốt bằng dữ liệu mẫu trước: một campus, một manager, vài nhân viên, có trường hợp đủ/thiếu/trùng template. Các con số chỉ để tạo mẫu kiểm tra, không ràng buộc quy mô thật.

## 5. Danh sách nhóm năng lực để lên BE

Identity/scope → catalog/versioning → cycle/config approval → assignment/coverage → assessment/feedback → achievement adapter → calculation → normalization/publication → notification/audit.

Thiết kế hợp đồng API sau khi đã thống nhất trạng thái và điều kiện lệnh: input, output, quyền, precondition, lỗi, idempotency và revision. Chuẩn hóa cách trả lỗi hết quyền, sai trạng thái, thiếu dữ liệu và xung đột cập nhật để FE xử lý rõ ràng.

**[Đề xuất]** Có thể bắt đầu bằng modular monolith để giữ transaction và phân quyền nhất quán; chỉ tách service khi có nhu cầu vận hành cụ thể. Đây là định hướng có thể thay đổi, chưa chọn stack hoặc triển khai mã.

## 6. Tiêu chí sẵn sàng chuyển sang coding

Các màn hình có dữ liệu đầu vào/đầu ra rõ; schema xác định được phiên bản và khóa nghiệp vụ; mỗi lệnh có role/scope/state guard; công thức điểm có ví dụ expected result; normalization có quy tắc lặp; các tình huống giữa/cuối năm khác nhau đã được xác nhận. Khi chưa chốt một phần, chỉ mock/wireframe phần đó với nhãn giả định rõ ràng.
