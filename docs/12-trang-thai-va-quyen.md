# 12 — Trạng thái, quyền và tiêu chí kiểm tra xuyên module

Toàn bộ tên trạng thái, ma trận quyền chi tiết và các kiểm tra dưới đây là **[Đề xuất]**. BPMN có lane và đường đi, không có enum trạng thái hay đặc tả authorization.

## 1. Phân tách các vòng đời

| Đối tượng | Trạng thái gợi ý | Lưu ý |
|---|---|---|
| KRA/KPI | DRAFT, ACTIVE, INACTIVE | Chỉ Active có nhãn trực tiếp trong nguồn |
| Template/library version | DRAFT, PUBLISHED, ARCHIVED | Version Published không sửa nội dung trực tiếp |
| Campus configuration | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, USING_PUBLISHED_BASELINE | Baseline không đi qua phê duyệt local |
| Assignment run | PENDING, RUNNING, NEEDS_RESOLUTION, COMPLETED, FAILED | Lỗi một người khác lỗi cả job |
| GoalSet | ASSIGNED, SUBMITTED | Mở lại/chỉnh sửa cần quy trình riêng |
| Mid-year round | SELF_DRAFT, SELF_SUBMITTED, SELF_DISCUSSION, MANAGER_DRAFT, MANAGER_SUBMITTED, RATING_DISCUSSION, COMPLETED | Discussion có thể đi qua nhanh nếu chọn No |
| Year-end round | SELF_DRAFT, SELF_SUBMITTED, MANAGER_REVIEW, MANAGER_DRAFT, MANAGER_SUBMITTED | Không có vòng phản hồi Employee theo nguồn |
| Calculation | PENDING, PROCESSING, READY, FAILED, SUPERSEDED | Lưu raw score theo input revision |
| Normalization session | DRAFT, IN_REVIEW, READY_TO_PUBLISH, PUBLISHED | Chính sách readiness cần chốt |
| Notification delivery | PENDING, SENT, FAILED | Trạng thái đọc lưu riêng |

Trạng thái cấp chu kỳ như `SETUP`, `GOAL_ASSIGNMENT`, `MID_YEAR_OPEN`, `YEAR_END_OPEN`, `NORMALIZATION`, `PUBLISHED`, `CLOSED` có thể dùng để điều hành, nhưng chưa được nguồn xác định đầy đủ. Không tự đóng cả chu kỳ khi một nhân viên xem kết quả.

## 2. Chuyển trạng thái nghiệp vụ chính

| Lệnh | Điều kiện đề xuất | Kết quả / tác động |
|---|---|---|
| Publish library | Corporate HR; template/rubric hợp lệ | Chốt version Published |
| Submit configuration | Campus HR đúng scope; draft hợp lệ | Pending approval, khóa snapshot |
| Approve / Reject | Corporate HR; yêu cầu còn pending; đúng revision | Lưu quyết định và lý do |
| Assign goals | Campus HR đúng scope; cấu hình hợp lệ | Tạo bộ goal, kiểm tra coverage |
| Submit goal | Employee chính chủ; goal hợp lệ | Chốt goal revision, chuẩn bị self-rating |
| Submit self-rating | Employee chính chủ; round mở; đủ item | Chốt self submission, thông báo Manager |
| Comment / Respond | Đúng người, đúng context và lượt xử lý | Lưu message, chuyển lượt hoặc kết thúc |
| Submit manager rating | Manager được phân công; đúng giai đoạn; đủ dữ liệu | Chốt manager submission; notify/tính điểm theo round |
| Normalize | Corporate HR; raw score Ready; đúng scope | Tạo iteration preview và kết quả |
| Publish final | Corporate HR; kết quả hợp lệ, đủ điều kiện | Snapshot công bố; Employee được xem |

Không cập nhật enum từ client để đi tắt quy trình. Endpoint hành động cần kiểm tra trạng thái hiện tại trong cùng transaction với thay đổi; xử lý submit lặp theo idempotency/version.

## 3. Ma trận quyền đề xuất

Ký hiệu: **C** = theo phạm vi công ty được cấp; **K** = campus được cấp; **N** = nhân viên được phân công; **T** = chính mình; **?** = cần chốt; **—** = chưa đề xuất quyền. Đây là mức quyền khởi đầu phục vụ thảo luận, không suy ra quyền đọc rộng chỉ từ lane.

| Chức năng | Corporate HR | Campus HR | Manager | Employee |
|---|---|---|---|---|
| Quản lý KRA/KPI và global template/rubric | C | Xem bản được phát hành | — | Xem rubric đã gán cho T |
| Tạo/clone chu kỳ, sửa local config | ? | K | — | — |
| Duyệt thay đổi local | C | Gửi yêu cầu trong K | — | — |
| Phân bổ/gán lại goal | ? | K | Xem goal N | Xem/submit goal T |
| Submit self-rating | — | — | T nếu bản thân là Employee | T |
| Xem self-rating đã submit | ? | ? | N | T |
| Chấm Manager rating | — | — | N | — |
| Feedback giữa năm | ? | ? | N | T |
| Feedback self-rating cuối năm | — | — | N | Xem theo chính sách ? |
| Xem điểm pre-normalization | C | ? | ? | — |
| Scale và publish | C | — | — | — |
| Xem final result đã công bố | C | ? | ? | T |
| Audit/notification | Theo phạm vi được cấp | Theo phạm vi được cấp | Theo hồ sơ được cấp | Theo hồ sơ được cấp |

**[Cần chốt]** Có cấm người duyệt duyệt yêu cầu do chính mình tạo trong trường hợp kiêm nhiều role không? Có quyền admin kỹ thuật riêng không? Không có lane Admin trong BPMN.

## 4. Bất biến cần bảo vệ

1. Employee chỉ đọc/ghi đúng hồ sơ của mình; Manager đúng quan hệ phân công của chu kỳ.
2. Goal, rubric và rating giữa năm/cuối năm không bị ghi đè lẫn nhau.
3. Không áp dụng cấu hình local chưa được phép dùng.
4. Không có hai bộ goal hiệu lực cho cùng participant theo chính sách một bộ/chu kỳ đề xuất.
5. Điểm đã submit/công bố gắn revision và có thể giải thích từ dữ liệu gốc.
6. Không coi thao tác đọc màn hình hoặc hết thời gian là quyết định “hài lòng”.
7. Lỗi notification không xóa hoặc rollback submission đã commit.
8. Publish không làm lộ preview hoặc hồ sơ ngoài scope.

## 5. Các kịch bản kiểm thử nghiệp vụ cho giai đoạn triển khai

| Mã | Kịch bản | Kết quả mong đợi đề xuất |
|---|---|---|
| AC01 | Global rubric không cần sửa | Đi từ xem default rubric đến publish |
| AC02 | Campus dùng nguyên baseline | Không cần gửi duyệt local |
| AC03 | Cấu hình bị từ chối rồi sửa/gửi lại | Lưu cả hai revision và quyết định |
| AC04 | Có nhân viên trùng và nhân viên thiếu template cùng lúc | Báo đủ hai nhóm lỗi; không hoàn tất sai |
| AC05 | Gán lại hoặc submit lặp do bấm hai lần | Một kết quả hiệu lực; không tạo dữ liệu trùng |
| AC06 | Mid-year không feedback ở cả hai giai đoạn | Đi tiếp đúng thứ tự đến cuối năm |
| AC07 | Mid-year có nhiều vòng comment/respond | Giữ thread/context, cho kết thúc bằng thao tác rõ |
| AC08 | Year-end Manager chọn feedback Yes và No | Cả hai đến manager rating; không chờ Employee trả lời |
| AC09 | Achievement tự động thiếu dữ liệu | Hiện thiếu dữ liệu; không tự dùng 0 |
| AC10 | Tính điểm lỗi hoặc input đã cũ | Không công bố kết quả lỗi; giữ snapshot cũ |
| AC11 | Scale up/down nhiều lần | Truy được baseline, tham số và iteration được chọn |
| AC12 | Employee truy cập trước publish hoặc đổi ID người khác | BE từ chối đúng phạm vi |
| AC13 | Notify thất bại rồi retry | Submission còn nguyên; không gửi trùng khi retry thành công |
| AC14 | Sửa danh mục sau publish | Kết quả lịch sử không thay đổi |

Đây là danh sách nghiệm thu để dùng khi xây FE/BE, chưa phải test đã chạy trên một ứng dụng có sẵn.
