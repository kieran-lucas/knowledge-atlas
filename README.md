# Knowledge Atlas

Knowledge Atlas dùng trực tiếp Tree của LifeWeave với dữ liệu Vật lý. Cây có root SPhO, sáu ngành đã chốt, 64 lá chính thức và 12 lá Quang hình học bổ sung. Mã và điểm lưu trước đây được giữ nguyên.

## Chạy và kiểm thử

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

`pnpm build` chạy TypeScript rồi build Vite vào `dist/`. Chạy `pnpm test:browser` khi dev server hoạt động tại `http://127.0.0.1:5173`. Có thể đặt `ATLAS_URL` để dùng cổng khác và `CHROME_PATH` để chọn Chrome; mặc định là đường dẫn Chrome thông thường trên Windows.

## Tree được sao chép từ đâu

Các file runtime trong `src/lifeweave/` được sao chép từ `lifeweave-desktop/frontend/src/`, giữ cấu trúc thư mục và import tương đối gốc. Có 18 file giữ nguyên byte, gồm:

- `features/life/lifeTreeLayout.ts`: toàn bộ thuật toán layout, kích thước node, khoảng cách và Bézier gốc. Không còn bản layout tăng chiều cao hoặc card dựng lại của phiên bản Atlas trước.
- `LifeEditWorkspace.css.ts`: CSS Tree gốc, bao gồm card, chọn/hover, pip trạng thái, animation và canvas. `LifeScreen.css.ts` vẫn được lưu để đối chiếu, nhưng header và toolbar không còn được render trong app.
- Theme, contract, motion, typography, global styles và focus utilities của design system.
- Icon, icon catalog, confidence metadata, TagChipList và các type projection mà renderer dùng.

`features/life/LifeEditWorkspace.tsx` được tách trực tiếp từ file gốc bằng `scripts/sync-lifeweave.py`, giữ Positioner, DOM card, class CSS, SVG links và selection. Các hàm navigation gốc vẫn được giữ nguyên cho chế độ tham chiếu; bản tràn viền dùng camera adapter mô tả bên dưới. Các thay đổi cần thiết là nhận projection qua props thay cho IPC/Tauri, bỏ chức năng chỉnh cấu trúc Life, thêm slot trạng thái và điều chỉnh điểm lá. Nút điểm thay dòng trạng thái trên card đang chọn; không tăng kích thước card hoặc thay layout.

`src/atlas/projection.js` ánh xạ dữ liệu Vật lý vào contract `LifeEditNodeView`; `src/atlas/useProgress.js` quản lý lưu/nhập/xuất; `src/atlas/atlasTree.css.ts` đặt vị trí bộ điểm nội tuyến và nhấn nhẹ đường nối tới node đang chọn. `src/style.css` chứa canvas toàn cửa sổ và tìm kiếm chỉ hiện khi gọi bằng phím tắt. `atlasTree.css.ts` thêm hai lớp bỏ viền/góc bo/khoảng đệm quanh canvas; hình dáng card và layout gốc vẫn giữ nguyên.

Bản gốc đầy đủ của renderer nằm trong `vendor/lifeweave/LifeEditWorkspace.tsx`. `docs/lifeweave-source-manifest.json` ghi source commit và SHA-256 của từng file; `docs/lifeweave-renderer.diff` chỉ rõ khác biệt renderer. Có thể chạy lại script đồng bộ khi source LifeWeave tồn tại tại đường dẫn đã cấu hình trong script; build và runtime Atlas không cần source project.

## Tương tác

App chỉ hiển thị cây tràn viền: không header, thanh công cụ, dòng hướng dẫn hoặc title bar Windows. Click hoặc Space để chọn, click lại/nền hoặc Escape để bỏ chọn; double-click hoặc Enter để mở/thu nhánh. Chỉ lá được chọn mới có −/+ nội tuyến, mỗi click đúng một điểm.

- Kéo nền, cuộn hoặc phím mũi tên để di chuyển.
- Ctrl + cuộn để zoom tại con trỏ; Ctrl +/− để zoom quanh tâm, Ctrl+0 hoặc double-click nền trống để vừa màn hình.
- Ctrl+Home để thu về root và sáu ngành.
- Ctrl+F gọi tìm kiếm theo tên/mã, hỗ trợ tiếng Việt không dấu; ↑/↓ chọn kết quả, Enter mở, Escape đóng và trả focus.
- Ctrl+S xuất JSON; Ctrl+O nhập JSON.
- Trên lá đang chọn: Ctrl+Z hoàn tác, Ctrl+Shift+Z hoặc Ctrl+Y làm lại. Khi đang gõ trong ô tìm kiếm, các phím này vẫn dành cho văn bản.
- Alt+F4 đóng app Windows.

Di chuột lên trạng thái để xem phân loại, độ phủ và thống kê chính thức khi khác tổng thể. BS nghĩa là bổ sung.

## Chương trình và điểm

`src/curriculum.js` giữ hierarchy đã chốt; `src/syllabus-original.json` giữ nguyên văn từng mục từ PDF, kể cả lỗi in. PDF nằm tại `docs/Noi-dung-SPhO.pdf`, lấy từ [PTIT](https://giaovu.ptit.edu.vn/wp-content/uploads/sites/13/2026/09/3.-Noi-dung-SPhO.pdf); văn bản trích dùng để đối chiếu mã nằm tại `docs/syllabus-extracted.txt`.

Điểm chưa đánh giá là null. Nhóm dùng `0.7 × mean + 0.3 × mean(ceil(25% số lá đã chấm) thấp nhất)`. SPhO lấy trung bình bằng nhau của những phần đã có điểm trong 12 phần chính thức; phần chưa chấm không bị coi là 0. Quang hình học không tham gia điểm chính thức. Độ phủ đếm toàn bộ lá hậu duệ; tooltip ghi thêm độ phủ chính thức khi hai tập khác nhau.

Tiến độ tự lưu trong localStorage theo origin trình duyệt. Export JSON dùng schema version 1; import kiểm tra ID lá, điểm nguyên 0–100 và timestamp, lưu bản sao dữ liệu cũ trước khi thay thế. Khi dữ liệu lưu lỗi, bản gốc được giữ và vẫn có thể xuất để phục hồi. Không phát hiện dataset cũ cần migration trong repository; không suy đoán mapping.

## Bằng chứng kiểm tra

`pnpm test` có 41 bài kiểm thử, gồm curriculum, scoring, import, layout, SHA-256 của 18 file sao chép, camera và tìm kiếm. Browser test kiểm tra camera giữ điểm dưới con trỏ khi zoom, tổng quan ở giữa cửa sổ, điều hướng kết quả bằng phím, điểm/camera không đổi ngoài ý muốn và persistence/JSON round trip. Ảnh nằm tại `screenshots/`.

`tests/lifeweave-parity.html` render cùng dữ liệu bằng Positioner nguyên gốc và Positioner tích hợp vào Atlas. Browser test kiểm tra DOM, computed styles và hình học trùng nhau ở ba trạng thái mặc định/selected/actions trong cùng một trang, đồng thời chụp ảnh đối chiếu. PNG byte equality chỉ được ghi nhận trong `docs/visual-parity-report.json`: các lần chụp trên máy này có thể khác ở vùng chữ dù DOM/style/geometry trùng nhau. Đây là đối chiếu renderer Tree hiện tại, không phải chạy toàn bộ Tauri LifeWeave.

## Cải tiến 1.0.1

Tổng quan tự căn giữa theo bounds thật của node. Mở/thu nhánh sẽ focus nội dung của nhánh; search luôn đưa lá về giữa ở 100% để đọc và chỉnh điểm. Camera có thêm khoảng cuộn ảo quanh cây để node sát mép cũng được căn giữa, không thay đổi tọa độ hoặc kích thước do layout gốc tạo ra.

`src/atlas/useAtlasCamera.ts` quản lý camera cho bản tràn viền bằng chính scroll/zoom CSS đang dùng, giữ pointer pan và hình học LifeWeave. Chuyển camera dùng thời gian traversal và easing từ motion tokens gốc; chế độ Reduced Motion chuyển tức thì. Ctrl+cuộn zoom liên tục quanh con trỏ, dải 8–175%; Ctrl+0 fit cây đang hiện, Ctrl+Home trở về tổng quan sáu ngành. Điểm và selected state không bị thay đổi khi zoom/pan/resize.

`src/atlas/search.js` xếp mã syllabus trùng chính xác trước substring, tìm được chữ có/không dấu và nhiều từ. Search chỉ xuất hiện khi được gọi, giữ giao diện mặc định chỉ có cây.

## Hệ thống chấm điểm 1.0.2

`src/atlas/GradeControls.jsx` giữ bộ − / điểm / + ngay trên lá được chọn. Nút có vùng bấm lớn hơn, trạng thái giới hạn rõ ràng và giữ focus bàn phím khi tới 0/100. Điểm chưa đánh giá hiển thị “Chưa chấm” với vạch đứt; điểm 0 hiển thị 0/100. Vạch tiến độ và sắc thái đỏ/vàng/xanh dùng màu semantic của LifeWeave. Node cha chỉ hiển thị số tổng hợp và độ phủ.

`src/atlas/gradeState.ts` là bộ xử lý lệnh thuần: chỉ nhận ID lá và delta ±1, chặn bước khác, không tạo timestamp hay lịch sử giả khi đã chạm giới hạn. Hoàn tác/làm lại độc lập trên mỗi lá; hoàn tác lần đánh giá đầu trả về null và giảm đúng coverage. Lịch sử giữ tối đa 100 thao tác mỗi lá trong phiên hiện tại, không lưu qua reload/đóng app và không nằm trong JSON xuất. Import bắt đầu một lịch sử mới để không áp dụng nhầm lệnh trước khi nhập.

`useProgress` xử lý liên tiếp cả các lần click trong cùng một lượt React render để không mất bước tăng/giảm; mỗi thay đổi, undo và redo đều tự lưu. Các mức hiển thị phân loại theo con số làm tròn đang thấy; công thức tổng hợp vẫn giữ độ chính xác đầy đủ.

## Ứng dụng Windows

`pnpm desktop:build` build bản Windows Tauri, nhúng toàn bộ frontend vào `src-tauri/target/release/knowledge-atlas.exe`; không cần Vite khi chạy. `pnpm desktop:publish` build rồi sao chép thành `Knowledge Atlas.exe` trên Desktop của tài khoản hiện tại. Có thể dùng `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/publish-desktop.ps1 -SkipBuild` để chép bản đã build. Khi thay một exe có nội dung khác, script giữ bản trước trong `desktop-backups/`.

Cần Microsoft Edge WebView2 Runtime để mở app. Tiến độ của app dùng vùng dữ liệu riêng theo identifier `dev.knowledgeatlas.desktop`, tách khỏi localStorage của bản chạy bằng trình duyệt. Có thể xuất/nhập JSON để chuyển tiến độ giữa hai bản. Cửa sổ Windows không có title bar, cây phủ kín vùng hiển thị; identifier và vùng dữ liệu tiến độ giữ nguyên qua lần cập nhật này.
