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

`features/life/LifeEditWorkspace.tsx` được tách trực tiếp từ file gốc bằng `scripts/sync-lifeweave.py`, giữ Positioner, DOM card, class CSS, SVG links, selection, initial camera và nguyên các hàm pan/wheel/keyboard/zoom/center. Các thay đổi cần thiết là nhận projection qua props thay cho IPC/Tauri, bỏ chức năng chỉnh cấu trúc Life, thêm slot trạng thái và điều chỉnh điểm lá. Nút điểm thay dòng trạng thái trên card đang chọn; không tăng kích thước card hoặc thay layout.

`src/atlas/projection.js` ánh xạ dữ liệu Vật lý vào contract `LifeEditNodeView`; `src/atlas/useProgress.js` quản lý lưu/nhập/xuất; `src/atlas/atlasTree.css.ts` chỉ đặt vị trí bộ điểm nội tuyến. `src/style.css` chứa canvas toàn cửa sổ và tìm kiếm chỉ hiện khi gọi bằng phím tắt. `atlasTree.css.ts` thêm hai lớp bỏ viền/góc bo/khoảng đệm quanh canvas; hình dáng card và layout gốc vẫn giữ nguyên.

Bản gốc đầy đủ của renderer nằm trong `vendor/lifeweave/LifeEditWorkspace.tsx`. `docs/lifeweave-source-manifest.json` ghi source commit và SHA-256 của từng file; `docs/lifeweave-renderer.diff` chỉ rõ khác biệt renderer. Có thể chạy lại script đồng bộ khi source LifeWeave tồn tại tại đường dẫn đã cấu hình trong script; build và runtime Atlas không cần source project.

## Tương tác

App chỉ hiển thị cây tràn viền: không header, thanh công cụ, dòng hướng dẫn hoặc title bar Windows. Click hoặc Space để chọn, click lại/nền hoặc Escape để bỏ chọn; double-click hoặc Enter để mở/thu nhánh. Chỉ lá được chọn mới có −/+ nội tuyến, mỗi click đúng một điểm.

- Kéo nền, cuộn hoặc phím mũi tên để di chuyển.
- Ctrl + cuộn hoặc Ctrl +/− để zoom; Ctrl+0 để vừa màn hình.
- Ctrl+Home để thu về root và sáu ngành.
- Ctrl+F gọi tìm kiếm theo tên/mã; Enter để chọn kết quả đầu, Escape để đóng.
- Ctrl+S xuất JSON; Ctrl+O nhập JSON.
- Alt+F4 đóng app Windows.

Di chuột lên trạng thái để xem phân loại, độ phủ và thống kê chính thức khi khác tổng thể. BS nghĩa là bổ sung.

## Chương trình và điểm

`src/curriculum.js` giữ hierarchy đã chốt; `src/syllabus-original.json` giữ nguyên văn từng mục từ PDF, kể cả lỗi in. PDF nằm tại `docs/Noi-dung-SPhO.pdf`, lấy từ [PTIT](https://giaovu.ptit.edu.vn/wp-content/uploads/sites/13/2026/09/3.-Noi-dung-SPhO.pdf); văn bản trích dùng để đối chiếu mã nằm tại `docs/syllabus-extracted.txt`.

Điểm chưa đánh giá là null. Nhóm dùng `0.7 × mean + 0.3 × mean(ceil(25% số lá đã chấm) thấp nhất)`. SPhO lấy trung bình bằng nhau của những phần đã có điểm trong 12 phần chính thức; phần chưa chấm không bị coi là 0. Quang hình học không tham gia điểm chính thức. Độ phủ đếm toàn bộ lá hậu duệ; tooltip ghi thêm độ phủ chính thức khi hai tập khác nhau.

Tiến độ tự lưu trong localStorage theo origin trình duyệt. Export JSON dùng schema version 1; import kiểm tra ID lá, điểm nguyên 0–100 và timestamp, lưu bản sao dữ liệu cũ trước khi thay thế. Khi dữ liệu lưu lỗi, bản gốc được giữ và vẫn có thể xuất để phục hồi. Không phát hiện dataset cũ cần migration trong repository; không suy đoán mapping.

## Bằng chứng kiểm tra

`pnpm test` có 10 bài kiểm thử, gồm kiểm tra SHA-256 của các file sao chép và so nội dung hàm navigation với source snapshot. Browser test kiểm tra thao tác điểm, camera/layout không đổi khi chấm, tìm kiếm, persistence và JSON round trip. Ảnh nằm tại `screenshots/`.

`tests/lifeweave-parity.html` render cùng dữ liệu bằng Positioner nguyên gốc (tách không sửa từ source) và Positioner đang dùng trong Atlas. Browser test so PNG chính xác ở ba trạng thái mặc định/selected/actions với animation được đưa đến trạng thái kết thúc; cả ba khớp pixel. Đây là đối chiếu renderer Tree hiện tại, không phải chạy toàn bộ ứng dụng Tauri LifeWeave. Nội dung trạng thái SPhO và nút điểm là các thay đổi chủ đích trên renderer đó.

## Ứng dụng Windows

`pnpm desktop:build` build bản Windows Tauri, nhúng toàn bộ frontend vào `src-tauri/target/release/knowledge-atlas.exe`; không cần Vite khi chạy. `pnpm desktop:publish` build rồi sao chép thành `Knowledge Atlas.exe` trên Desktop của tài khoản hiện tại. Có thể dùng `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/publish-desktop.ps1 -SkipBuild` để chép bản đã build. Khi thay một exe có nội dung khác, script giữ bản trước trong `desktop-backups/`.

Cần Microsoft Edge WebView2 Runtime để mở app. Tiến độ của app dùng vùng dữ liệu riêng theo identifier `dev.knowledgeatlas.desktop`, tách khỏi localStorage của bản chạy bằng trình duyệt. Có thể xuất/nhập JSON để chuyển tiến độ giữa hai bản. Cửa sổ Windows không có title bar, cây phủ kín vùng hiển thị; identifier và vùng dữ liệu tiến độ giữ nguyên qua lần cập nhật này.
