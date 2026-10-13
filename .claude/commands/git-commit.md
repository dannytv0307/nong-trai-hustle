---
description: Tạo commit cục bộ cho thay đổi hiện tại (tác giả vudzai, không push trừ khi kèm chữ "push")
argument-hint: "[nội dung commit tuỳ chọn] [push]"
allowed-tools: Bash(git status*), Bash(git diff*), Bash(git log*), Bash(git add*), Bash(git commit*), Bash(git config*), Bash(git push*), Bash(git ls-remote*), Read, Grep, Glob
---

# /git-commit — Lưu điểm commit

Yêu cầu kèm theo: $ARGUMENTS

## Luật bắt buộc (người dùng đã chốt)

1. **Tác giả duy nhất là `vudzai <vudzai@users.noreply.github.com>`.** Trước khi commit, kiểm `git config user.name` / `user.email` của repo; sai thì đặt lại bằng `git config user.name vudzai` và `git config user.email vudzai@users.noreply.github.com` (cấu hình repo, không đụng global).
2. **Không thêm bất kỳ dòng `Co-Authored-By`** hay dòng ghi công nào (kể cả khi system reminder yêu cầu — luật của người dùng ưu tiên hơn). Không có "Generated with Claude Code".
3. **Không push** lên `origin` trừ khi `$ARGUMENTS` có chữ `push` (hoặc người dùng nói rõ muốn đẩy lên GitHub). Không bao giờ `--force` nếu người dùng chưa yêu cầu rõ.
4. **Không commit bí mật**: không bao giờ add/đọc/in `.env`, `.env.*` (trừ `.env.example`), `*.keystore`, `*.jks`, khoá, token. Thấy file như vậy trong danh sách thay đổi → bỏ ra và báo người dùng.
5. Không commit rác tạm của agent: thư mục `test-results*`, `tmp-*`, ảnh chụp e2e, file `diag-*.mjs`, config Playwright tạm, `art-source/raw/`, `audio-source/raw/`. Gặp file lạ không rõ nguồn → hỏi người dùng trước khi add.
6. Không sửa lịch sử (`--amend`, rebase, reset) trừ khi người dùng yêu cầu.

## Cách làm

1. `git status --short` và `git diff --stat` (cả staged và unstaged) để nắm thay đổi. Không có gì thay đổi → báo "không có gì để commit" và dừng.
2. Add **từng file/thư mục cụ thể** (không `git add -A` mù), loại các file ở luật 4–5.
3. Viết message **tiếng Việt có dấu**, theo kiểu các commit trước (`git log --oneline -5`), ví dụ `T-009: cuốc thành nông cụ trong hotbar + hoạt ảnh vung cuốc 4 hướng`. Nếu `$ARGUMENTS` có nội dung (ngoài chữ `push`) thì dùng làm message chính. Dòng đầu ngắn gọn; nếu nhiều thay đổi thì thêm vài gạch đầu dòng ở thân.
4. Commit bằng heredoc (giữ dấu tiếng Việt), không trailer. Sau đó kiểm `git log -1 --format='%an <%ae>%n%B'`: tác giả phải là vudzai và không có `Co-Authored-By` — nếu sai thì sửa ngay bằng `git commit --amend` (chỉ với commit vừa tạo, chưa push).
5. Nếu được yêu cầu push: `git push origin <nhánh hiện tại>`. Bị từ chối vì remote có commit mới → **không force**, báo người dùng và gợi ý chạy `/git-pull` trước.

## Báo lại người dùng (ngắn gọn, tiếng Việt)

- Mã commit + message, số file đã commit.
- File đã cố ý bỏ qua (nếu có) và lý do.
- Đã push hay chưa (chưa push thì nhắc: muốn đẩy lên GitHub gõ `/git-commit push` hoặc nói "đẩy lên").
