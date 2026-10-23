# M03 — Template theo chức danh và rubric

## 1. Mục đích và dữ liệu nguồn

**[BPMN]** Corporate HR tạo `Designation Based Template Library`, kiểm tra rubric, dùng rubric mặc định hoặc tùy chỉnh score range/mô tả của từng KPI, xem lại rồi `Publish Library for Campus Level`.

Template liên kết chức danh với bộ KRA/KPI; rubric cung cấp căn cứ chấm điểm. **[Cần chốt]** BPMN dùng xen kẽ “Role Based” và “Designation Based” trong nhãn. Tài liệu tạm hiểu là template theo chức danh, không coi vai trò hệ thống Employee/Manager là designation.

## 2. Luồng chi tiết

1. Tạo thư viện template (`Activity_0bnucj2`) từ KRA/KPI Active.
2. Gateway `Gateway_0ruqb61` kiểm tra có cần cấu hình rubric.
3. Không cần: xem `Default Global Rubric` (`Activity_0yliwah`), đọc `DataStoreReference_13j2lup`.
4. Có: tùy chỉnh khoảng điểm hoặc mô tả của từng khoảng cho KPI (`Activity_0180jgy`), sau đó xem rubric tùy chỉnh (`Activity_1uakphc`).
5. Hai nhánh hợp ở `Gateway_01fnm8s`, rồi Corporate HR phát hành thư viện (`Activity_1vyds18`).
6. Campus HR dùng thư viện đã phát hành để tạo/clone chu kỳ trong M04.

Đây là các bước **[BPMN]**. Không có nhánh duyệt cấp trên đối với lần phát hành thư viện toàn công ty.

## 3. Dữ liệu và quy tắc đề xuất

| Thành phần | Nội dung |
|---|---|
| Template library version | Mã thư viện, phiên bản, trạng thái, thời điểm/người phát hành |
| Template | Tên, tập designation áp dụng, danh sách tiêu chí |
| Template item | KRA/KPI version, thứ tự hiển thị, rubric version; target/weight nếu được chốt |
| Rubric version | Nguồn global/custom, tập mức điểm và mô tả |
| Rubric level | Điểm hoặc khoảng điểm, nhãn, mô tả; ranh giới achievement nếu dùng quy đổi tự động |

Phải phân biệt **khoảng điểm của rubric** với **khoảng achievement để suy ra điểm**. Nguồn chỉ nêu score range và mô tả, chưa định nghĩa phép ánh xạ giá trị thực tế sang điểm.

**[Đề xuất]** Template ở trạng thái `DRAFT → PUBLISHED → ARCHIVED`; nội dung đã phát hành là bất biến, thay đổi tạo version mới. Chu kỳ tham chiếu đúng version, không tự nhận bản mới.

Kiểm tra trước phát hành: có designation áp dụng, có tiêu chí hợp lệ, mỗi KPI có rubric hiệu lực, mức điểm không mâu thuẫn. Nếu dùng khoảng số thì cần quy định rõ đóng/mở ở biên, ví dụ `[a,b)`; không tự chọn thang 1–5 hoặc tổng trọng số 100% khi chưa được xác nhận.

## 4. Mapping designation và lỗi phân bổ

**[BPMN]** Quy trình kiểm tra sau khi gán có thể phát hiện một nhân viên nhận trùng template hoặc không nhận template. Vì vậy không thể kết luận từ sơ đồ rằng mapping luôn duy nhất ngay ở thư viện.

**[Đề xuất]** Có màn hình kiểm tra coverage trước phát hành và trước gán: designation chưa có template, designation trỏ nhiều template và số nhân viên ảnh hưởng. Nếu sản phẩm chọn quy tắc một template/người/chu kỳ, cần quy tắc ưu tiên hoặc chặn cấu hình chồng lấn. Không lặng lẽ chọn template đầu tiên.

## 5. Gợi ý FE/BE

FE: thư viện template, form chọn KRA/KPI Active, mapping chức danh, trình sửa rubric, preview template/rubric, kiểm tra coverage và xác nhận phát hành.

BE: lấy tiêu chí Active từ M02, kiểm tra rubric và mapping, quản lý phiên bản, phát hành nguyên tử, cung cấp thư viện Published cho M04. Nhóm API đề xuất: `template-libraries`, `templates`, `rubrics`, `template-versions`, hành động `publish`.

## 6. Nghiệm thu và điểm cần chốt

Nghiệm thu đề xuất: chọn rubric mặc định và tùy chỉnh đều đi đến phát hành; phiên bản chưa phát hành chưa dùng để phân bổ; sửa rubric mới không thay đổi điểm lịch sử.

Cần chốt: thang điểm mặc định; mức rubric áp dụng theo KPI hay theo template; một template gắn bao nhiêu designation; quy tắc mapping trùng; template có weight/target riêng không; có cho sửa bản đã phát hành và cách tái áp dụng vào chu kỳ đang chạy.
