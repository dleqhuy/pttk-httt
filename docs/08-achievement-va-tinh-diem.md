# M08 — Achievement và tính điểm trước chuẩn hóa

## 1. Căn cứ từ BPMN

Nguồn achievement thủ công/tự động nằm ở phần cuối năm; Manager chấm theo rubric và submit. Sau submit, `Activity_1eai38x` (`Calculate Score pre Normalization`) chạy, rồi `Activity_1bi5h1k` thông báo Corporate HR bắt đầu chuẩn hóa. Hai task có annotation `Service / Automation Task` dù được đặt trong lane Manager.

**[BPMN]** Không có công thức, trọng số, quy tắc làm tròn, cách gộp KRA/KPI, cách xử lý N/A hay cách kết hợp self-rating với manager rating. Không có task tính tổng giữa năm được mô tả riêng.

## 2. Phân biệt các lớp dữ liệu

| Dữ liệu | Ví dụ minh họa — không phải dữ liệu nguồn |
|---|---|
| Achievement | Hoàn thành 92 đơn vị hoặc kết quả định tính có mô tả |
| Rubric | Các mức điểm được phép và tiêu chí đạt |
| Self-rating | Điểm nhân viên tự nhận |
| Manager rating item | Điểm quản lý xác nhận cho từng KPI |
| Pre-normalization score | Điểm tổng theo công thức được duyệt |
| Normalized/final score | Điểm sau điều chỉnh và bản công bố trong M09 |

Không đồng nhất achievement với điểm KPI. Không ghi đè self-rating bằng manager rating, và không ghi đè điểm gốc bằng điểm chuẩn hóa.

## 3. Luồng tính đề xuất

1. Nhận yêu cầu sau khi manager rating cuối năm submit thành công.
2. Lấy snapshot rating item, rubric, goal và cấu hình công thức hiệu lực.
3. Kiểm tra đủ dữ liệu bắt buộc, điểm hợp lệ, weight hợp lệ nếu công thức sử dụng.
4. Tính theo `formulaVersion` được phê duyệt; lưu các bước trung gian đủ để giải thích.
5. Lưu `ScoreCalculation` với kết quả trước chuẩn hóa, input revision và thời điểm.
6. Phát sự kiện sẵn sàng cho Corporate HR xem; M09 quản lý điều kiện bắt đầu theo tập nhân viên.

**[Đề xuất]** Nếu tính lỗi, giữ nguyên manager submission và đánh dấu `CALCULATION_FAILED`; cho retry cùng input. Không báo Corporate HR có kết quả hợp lệ khi chưa tính thành công.

## 4. Công thức: chỉ là phương án để thảo luận

Nếu nghiệp vụ xác nhận dùng trung bình trọng số của điểm Manager cuối năm:

```text
raw_score = sum(manager_kpi_score[i] * weight[i]) / sum(weight[i])
```

Đây là **[Đề xuất]**, không phải công thức đọc được từ BPMN. Chỉ dùng khi mọi điểm KPI cùng thang hoặc đã có quy tắc quy đổi thang. Ví dụ hai KPI cùng thang điểm, có điểm 4 và 3, weight 60 và 40: raw score = 3.6. Chưa áp dụng công thức này vào hệ thống khi chưa được chốt.

**[Cần chốt]** Có tính KRA trước rồi gộp lên tổng không? Có dùng self-rating hoặc điểm giữa năm không? Weight đặt ở KPI/KRA/template hay cả ba? N/A loại khỏi mẫu số hay tính 0? Làm tròn ở cấp nào và bao nhiêu chữ số? Thang khác nhau quy đổi ra sao?

## 5. Dữ liệu và tính nhất quán đề xuất

`AchievementRecord`: review item, nguồn, giá trị/đơn vị, external reference, fetchedAt/recordedAt, người nhập và revision.

`ScoreCalculation`: participant, review round, manager submission revision, formula version, input snapshot/hash, kết quả từng mức, raw score, trạng thái và lỗi nếu có.

- Sử dụng kiểu decimal và chính sách làm tròn rõ ràng khi điểm cần chính xác thập phân.
- Cùng input revision và formula version phải cho cùng kết quả; chạy lại không tạo nhiều kết quả hiệu lực khác nhau.
- Không tính khi weight tổng bằng 0 hoặc cấu hình không hợp lệ.
- Sửa rating sau submit phải tạo revision và làm kết quả cũ trở thành superseded theo chính sách; không âm thầm đổi snapshot M09 đang xem.
- API không nhận điểm tổng do client tự tính làm nguồn chính thức; BE tính và lưu kết quả.

## 6. Automation Input chưa phải tích hợp hoàn chỉnh

**[BPMN]** Nhánh `Automation Input` đi qua gateway mà không có connector hay task lấy dữ liệu. **[Cần chốt]** Nguồn HRIS/ERP nào, dữ liệu theo KPI/nhân viên/khoảng thời gian nào, tần suất cập nhật, cách đối soát, quyền sửa và fallback khi thiếu dữ liệu.

**[Đề xuất]** Xây adapter nguồn dữ liệu sau khi thống nhất hợp đồng; trong giai đoạn đầu có thể dùng dữ liệu mẫu có nguồn gốc rõ ràng để kiểm tra luồng. Không coi việc có nhánh automation là đã xác định API ngoài.

## 7. Gợi ý FE/BE và nghiệm thu

FE: giải thích điểm thành phần, nguồn achievement, trạng thái tính, lỗi thiếu dữ liệu và kết quả raw theo quyền. BE: adapter achievement, validator, calculation service, lưu snapshot và sự kiện sẵn sàng chuẩn hóa. Nhóm API: `achievements`, `score-calculations`, hành động `recalculate` dành cho người có quyền.

Nghiệm thu đề xuất: tính lặp cùng snapshot nhất quán; lỗi không bị hiển thị như điểm 0; không thể dùng điểm giữa năm thay điểm cuối năm do thiếu khóa vòng; thay đổi công thức không sửa kết quả lịch sử.
