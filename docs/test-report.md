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

## Nâng cấp trải nghiệm 1.0.1

- `pnpm test`: 18/18 thành công. Bổ sung invariant zoom giữ điểm dưới con trỏ, fit bounds thật và cây 76 lá, easing đơn điệu, tìm kiếm không dấu và xếp hạng mã chính xác.
- `pnpm test:browser`: thành công. Tổng quan căn giữa, camera điểm không đổi khi chấm, Ctrl+wheel bám con trỏ trong sai số dưới 2 CSS pixel, phím mũi tên/Enter trong search chọn GH.11 đúng, cùng các luồng scoring, import/export và mobile trước đó.
- Renderer đối chiếu trong cùng trang: DOM, computed typography/material/transform và geometry trùng hoàn toàn ở default, selected, actions. PNG captures được giữ để xem trực tiếp; việc so từng byte ảnh trên máy này không ổn định với sai khác ở vùng chữ giữa các lần capture, nên byte equality là thông tin chẩn đoán trong `visual-parity-report.json`, không thay thế kiểm tra DOM/style/geometry.
- Đã xem trực tiếp overview căn giữa và focus Quang hình học. Cây vẫn tràn viền, card và font LifeWeave giữ nguyên.

- `pnpm desktop:build`: release 1.0.1 thành công, đã cập nhật exe trên Desktop, giữ identifier và vùng tiến độ.
- Native smoke 1.0.1: mở app, chấm lá, lưu qua lần kết thúc/khởi động lại process, import và export JSON đều thành công. Viewport native phủ cửa sổ ở DPI 175%.
- Sample rAF trong 500 ms có thao tác focus: 78 khoảng frame, trung vị 6,1 ms, lớn nhất 24,2 ms trên máy hiện tại. Đây là phép đo cục bộ, không phải benchmark mọi cây/thiết bị.
- Đã xem ảnh native tổng quan căn giữa và lá đang chỉnh điểm trước khi bàn giao.

## Hệ thống chấm điểm 1.0.2

- `pnpm test`: 41/41 thành công, gồm engine chỉ cho lá, delta ±1, null/0, no-op ở biên và timestamp, undo/redo snapshot, lịch sử từng lá, giới hạn lịch sử, import reset, coverage, supplementary và ngưỡng hiển thị.
- `pnpm test:browser`: thành công. Kiểm tra hoàn tác đánh giá đầu về null, redo bằng Ctrl+Shift+Z/Ctrl+Y, không ảnh hưởng lá khác, không sửa điểm sau khi bỏ chọn, rapid clicks trong cùng lượt xử lý, nút vô hiệu ở 0/100 và camera/selection không đổi khi sửa/undo/redo.
- Import xóa lịch sử phiên trước; JSON schema 1 vẫn khôi phục chính xác. Màu trạng thái chỉ tác động badge/giá trị nhỏ, renderer và hình học card LifeWeave giữ nguyên.
- Đã xem ảnh chưa chấm, điểm thấp và điểm tối đa với tên X.2 dài; không có tràn chữ hoặc công cụ ngoài node.
- Native 1.0.2: release build và publish Desktop thành công. Đã xác nhận Ctrl+Z trả lần chấm đầu về null, Ctrl+Shift+Z/Ctrl+Y làm lại, điểm giữ qua lần kết thúc/khởi động lại process và JSON nhập/xuất giữ đúng điểm. Các bước native chạy trên profile kiểm thử riêng.
- Đã xem ảnh native ở DPI 175%; bộ điểm nằm gọn trong node. Sample rAF trong lần focus native: trung vị 6,1 ms, lớn nhất 6,3 ms trên máy hiện tại.
