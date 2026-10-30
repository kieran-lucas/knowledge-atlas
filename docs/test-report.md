# Báo cáo kiểm thử sau khi sao chép Tree trực tiếp

- `pnpm test`: 10/10 thành công. Bao gồm curriculum đối chiếu văn bản PDF, aggregation, import validation, layout, SHA-256 của 18 file upstream và nội dung nguyên các hàm pan/wheel/keyboard/zoom/center.
- `pnpm build`: TypeScript và Vite production build thành công.
- `node tests/browser.mjs`: thành công trên Chrome headless, desktop 1522×900 và mobile viewport 390×844. Kiểm tra chọn parent/leaf, +10/−7, Shift, cận 0/100, camera và tọa độ node không đổi khi chỉnh điểm, chọn lá khác/canvas/parent, số root và độ phủ, loại GH khỏi điểm chính thức, tìm VI.2/GH.10/X.2, reload, export/import, pan bằng phím và giao diện mobile.
- Không phát hiện node chồng nhau trong cấu trúc các nhánh đã mở ở kịch bản trình duyệt; unit test kiểm tra toàn bộ layout 76 lá.
- Pixel parity: Positioner nguyên gốc lấy từ snapshot LifeWeave và Positioner được tích hợp vào Atlas render cùng fixture, dùng chính CSS/theme/font upstream. PNG khớp chính xác ở default, selected và actions sau khi đưa animation tới trạng thái kết thúc. Ảnh đối chiếu là `lifeweave-original-*.png` và `lifeweave-copied-*.png`.
- Đã xem trực tiếp ảnh overview, lá đang chọn, tên dài X.2 và mobile. Card hiện dùng đúng kích thước/style/icon nguồn; nút điểm thay dòng state của lá được chọn.
- Giới hạn: chưa chạy toàn bộ ứng dụng Tauri gốc, chưa so mọi trạng thái hoặc mọi DPI/thiết bị cảm ứng. So sánh pixel xác nhận renderer và stylesheet đã sao chép, không bao gồm nội dung điểm SPhO vốn khác dữ liệu Life.

## Windows desktop build

- `pnpm desktop:build`: native release build thành công. Executable được nhúng frontend đầy đủ, không cần Vite.
- `scripts/publish-desktop.ps1 -SkipBuild`: đã chép `Knowledge Atlas.exe` ra Desktop. Hash và kích thước ghi tại `docs/desktop-artifact.json`.
- `tests/desktop-smoke.mjs`: chạy trực tiếp exe trên Desktop bằng WebView2, dùng profile kiểm thử riêng. Đã kiểm tra root/sáu nhánh, chỉnh điểm lá, persistence sau khi kết thúc và khởi động lại process, nhập JSON và xuất JSON. Tất cả thành công; chi tiết tại `docs/desktop-smoke-report.json`.
- Đã xem ảnh `screenshots/desktop-native-overview.png` và lưu thêm ảnh lá đang chọn. Profile kiểm thử không phải profile dùng thật.

## Cây tràn viền

- Đã bỏ header, footer, toolbar thường trực, khung bo quanh canvas và title bar Windows. Node và đường nối LifeWeave giữ nguyên.
- `pnpm test`: 10/10 thành công. `pnpm test:browser`: thành công, gồm kiểm tra canvas desktop 1522×900 phủ đúng cửa sổ và không có header/footer/nút ngoài cây; chấm điểm, camera, JSON và pixel parity vẫn qua.
- `pnpm desktop:build`: release build thành công; đã thay exe trên Desktop và giữ bản exe trước trong desktop-backups.
- Native smoke trên WebView2 ở DPI 175%: viewport bắt đầu tại (0,0), kích thước khớp client window trong sai số làm tròn dưới 1 CSS pixel. Chấm điểm, lưu sau khi khởi động lại và nhập/xuất JSON qua. Ảnh native đã được cập nhật.
- Những chức năng phụ được gọi bằng phím tắt: Ctrl+F tìm kiếm, Ctrl+S xuất, Ctrl+O nhập, Ctrl+0 fit, Ctrl+Home tổng quan, Ctrl+/− hoặc Ctrl+cuộn zoom. Alt+F4 đóng app không title bar.
