# 📐 Hướng dẫn sử dụng PlantUML

## Cách 1: Dùng Online (Nhanh nhất)

1. Truy cập: https://www.plantuml.com/plantuml/uml/
2. Copy nội dung file `.puml` vào ô bên trái
3. Xem kết quả bên phải
4. Download ảnh: PNG, SVG, hoặc PDF

## Cách 2: Dùng VS Code Extension

1. Cài extension: **PlantUML** (by jebbs)
2. Mở file `.puml`
3. Bấm `Alt + D` để xem preview
4. Chuột phải → Export → Chọn định dạng (PNG/SVG/PDF)

**Lưu ý:** Cần cài Java trước (https://www.java.com)

## Cách 3: Dùng PlantUML CLI

```bash
# Cài PlantUML
npm install -g node-plantuml

# Tạo ảnh từ file .puml
puml generate usecase_tong_quan.puml -o output.png
```

## Danh sách file đã tạo

### Use Case Diagrams
1. `usecase_tong_quan.puml` - Use Case tổng quan (gọn gàng)
2. `usecase_uc12_ban_hang_pos.puml` - UC12: Bán hàng POS (chi tiết)
3. `usecase_uc17_kds.puml` - UC17: KDS realtime (chi tiết)
4. `usecase_uc23_qrcode.puml` - UC23: Đặt món QR Code (chi tiết)

### Sequence Diagrams
5. `sequence_qrcode.puml` - Sequence: Khách đặt món qua QR Code
6. `sequence_pos.puml` - Sequence: Thu ngân bán hàng POS

### ERD
7. `erd_database.puml` - ERD Database đầy đủ

## Chỉnh sửa

- Mở file `.puml` bằng text editor
- Sửa nội dung theo cú pháp PlantUML
- Xem lại kết quả

## Tài liệu tham khảo

- PlantUML Guide: https://plantuml.com/guide
- Use Case: https://plantuml.com/use-case-diagram
- Sequence: https://plantuml.com/sequence-diagram
- ERD: https://plantuml.com/ie-diagram
