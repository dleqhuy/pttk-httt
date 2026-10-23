# M02 — Thư viện KRA/KPI

## 1. Mục đích

**[BPMN]** Corporate HR thực hiện `Create KPI parameter library (KRA - KPI)` (`Activity_0ncf5yw`), sau đó tạo template theo chức danh. Task tạo template đọc data store `DataStoreReference_1s4t7ot`, có nhãn `Extract KRA - KPI where: STATUS = Active`.

Kết luận trực tiếp: chỉ KRA/KPI Active được trích xuất cho bước tạo template. BPMN không định nghĩa cấu trúc trường, quy tắc sửa/xóa hay công thức KPI.

## 2. Luồng nghiệp vụ

1. **[BPMN]** Bắt đầu quy trình hoặc quay lại khi có nhân viên thiếu template.
2. **[BPMN]** Corporate HR tạo thư viện KRA/KPI.
3. **[BPMN]** Chuyển sang tạo thư viện template theo designation với dữ liệu Active.
4. **[Đề xuất]** Trên ứng dụng, cho tái sử dụng thư viện và bổ sung mục cần thiết; không bắt tạo lại toàn bộ tiêu chí mỗi khi sửa mapping chức danh.

## 3. Cấu trúc đề xuất

| Đối tượng | Trường nghiệp vụ gợi ý |
|---|---|
| KRA | Mã, tên, mô tả, trạng thái |
| KPI | Mã, KRA, tên, mô tả, đơn vị, loại dữ liệu achievement, trạng thái |
| Phiên bản KPI | Nội dung áp dụng, người cập nhật, thời điểm và lý do thay đổi |

**[Cần chốt]** Một KPI thuộc đúng một KRA hay dùng được nhiều KRA? KPI có target, weight, chiều tốt/xấu, hoặc kỳ đo riêng không? Những trường này hữu ích để tính điểm nhưng chưa được thể hiện trong nguồn.

## 4. Quy tắc đề xuất

- Mã KRA/KPI không trùng trong phạm vi được thống nhất; tên không để trống.
- Nếu dùng quan hệ một KRA–nhiều KPI, không cho KPI tham chiếu KRA không tồn tại.
- Chỉ chọn tiêu chí Active để thêm vào template mới, phù hợp data store của BPMN.
- Khi một KPI đã được dùng trong template/chu kỳ, chuyển Inactive hoặc tạo phiên bản mới; tránh xóa làm mất căn cứ đánh giá cũ.
- Vô hiệu hóa tiêu chí không tự sửa goal của nhân viên đã được gán. Lịch sử đánh giá cần đọc đúng nội dung tại thời điểm chốt.

Trạng thái gợi ý: `DRAFT → ACTIVE → INACTIVE`. Nguồn chỉ nêu `Active`, hai trạng thái còn lại là thiết kế bổ sung.

## 5. Đầu vào, đầu ra và ngoại lệ

Đầu vào là danh mục tiêu chí do Corporate HR xác định. Đầu ra là tập tiêu chí có thể chọn trong M03. Nếu không có KPI Active, việc tạo một template rỗng rồi phân bổ cần bị chặn theo quy tắc sản phẩm được xác nhận.

Khi sửa một tiêu chí đã được dùng, FE cần hiển thị nơi sử dụng; BE bảo toàn tham chiếu/phiên bản. Việc tạo một KPI mới không tự gán KPI đó cho mọi nhân viên.

## 6. Gợi ý FE/BE và nghiệm thu

FE: danh sách KRA, KPI theo KRA, form chi tiết, lọc trạng thái, lịch sử phiên bản. BE: quản lý danh mục, lọc Active, kiểm tra nơi sử dụng, xuất bộ tiêu chí cho template. Nhóm API đề xuất: `kras`, `kpis`, `kpi-versions`.

Nghiệm thu: KPI Inactive không xuất hiện trong lựa chọn tạo template mới; nhân viên vẫn xem được tiêu chí cũ đã chốt; cập nhật danh mục không làm mất điểm đã nhập.

## 7. Cần chốt trước khi phát triển

Danh mục dùng toàn công ty hay có phạm vi; quy trình Active/Inactive; quan hệ KRA–KPI; trường bắt buộc cho mỗi loại KPI; quyền sửa tiêu chí sau khi thư viện đã phát hành.
