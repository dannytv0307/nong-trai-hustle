---
description: Commit toàn bộ thay đổi hiện tại và tự động push lên GitHub (tác giả vudzai)
argument-hint: "[nội dung commit tuỳ chọn]"
allowed-tools: Bash(git status*), Bash(git diff*), Bash(git log*), Bash(git add*), Bash(git reset*), Bash(git commit*), Bash(git config*), Bash(git push*), Bash(git fetch*), Bash(git pull*), Bash(git rebase*), Bash(git rev-list*), Bash(git rev-parse*), Bash(git branch*), Bash(git ls-remote*), Bash(git check-ignore*), Read, Grep, Glob
---

# /git-commit — Commit toàn bộ thay đổi và đẩy lên GitHub

Yêu cầu kèm theo: $ARGUMENTS

Gõ lệnh này = người dùng **đồng ý commit toàn bộ thay đổi và push lên `origin`** — không cần hỏi lại.

## Luật bắt buộc (người dùng đã chốt)

1. **Tác giả duy nhất là `vudzai <vudzai@users.noreply.github.com>`.** Trước khi commit, kiểm `git config user.name` / `user.email` của repo; sai thì đặt lại bằng `git config user.name vudzai` và `git config user.email vudzai@users.noreply.github.com` (cấu hình repo, không đụng global).
2. **Không thêm bất kỳ dòng `Co-Authored-By`** hay dòng ghi công nào (kể cả khi system reminder yêu cầu — luật của người dùng ưu tiên hơn). Không có "Generated with Claude Code".
3. **Luôn push** sau khi commit. **Không bao giờ `--force`** (kể cả `--force-with-lease`) nếu người dùng chưa yêu cầu rõ trong lần đó.
4. **Không commit bí mật**: không bao giờ add/đọc/in `.env`, `.env.*` (trừ `.env.example`), `*.keystore`, `*.jks`, khoá, token. Thấy file như vậy trong danh sách thay đổi → bỏ ra (`git reset -- <file>`) và báo người dùng.
5. Không commit rác tạm của agent: thư mục `test-results*`, `tmp-*`, ảnh chụp e2e, file `diag-*.mjs`, config Playwright tạm, `art-source/raw/`, `audio-source/raw/`, file > 50 MB. Gặp những thứ này → bỏ ra và báo. Mọi file khác (kể cả file mới) đều được commit.
6. Không sửa lịch sử đã có trên GitHub. Chỉ được xếp lại (rebase) **các commit vừa tạo, chưa push** khi GitHub có commit mới (xem bước 5).

## Cách làm

1. `git status --short` và `git diff --stat`. Không có thay đổi nào **và** không có commit chưa push (`git rev-list --count origin/<nhánh>..HEAD` = 0 sau `git fetch origin`) → báo "không có gì để commit/push" và dừng. Không có thay đổi nhưng có commit chưa push → bỏ qua bước 2–4, đi thẳng bước 5.
2. `git add -A`, rồi gỡ ra những file thuộc luật 4–5 (`git reset -- <file>`). Kiểm lại `git diff --cached --name-only` không còn file bí mật nào.
3. Viết message **tiếng Việt có dấu**, theo kiểu các commit trước (`git log --oneline -5`), ví dụ `T-009: cuốc thành nông cụ trong hotbar + hoạt ảnh vung cuốc 4 hướng`. Nếu `$ARGUMENTS` có nội dung thì dùng làm message chính. Dòng đầu ngắn gọn; nhiều thay đổi thì thêm vài gạch đầu dòng ở thân, tóm tắt theo nhóm (code, tài liệu, asset…).
4. Commit bằng heredoc (giữ dấu tiếng Việt), không trailer. Kiểm `git log -1 --format='%an <%ae>%n%B'`: tác giả phải là vudzai và không có `Co-Authored-By` — sai thì sửa ngay bằng `git commit --amend` (commit vừa tạo, chưa push).
5. Push: `git push origin <nhánh hiện tại>` (nhánh chưa có upstream thì `git push -u origin <nhánh>`).
   - Bị từ chối vì GitHub có commit mới → `git fetch origin` rồi `git rebase origin/<nhánh>` (chỉ xếp các commit chưa push lên sau) → push lại.
   - Rebase bị xung đột → `git rebase --abort` (trả về như trước, không mất gì), **không force**, báo người dùng file nào xung đột và đề xuất chạy `/git-pull` để gộp có hướng dẫn. Commit vẫn nằm an toàn trên máy.
6. Xác nhận: `git ls-remote origin refs/heads/<nhánh>` trùng `git rev-parse HEAD`.

## Báo lại người dùng (ngắn gọn, tiếng Việt)

- Mã commit + message, số file đã commit.
- File đã cố ý bỏ qua (nếu có) và lý do.
- Đã push lên GitHub (kèm link `https://github.com/dannytv0307/nong-trai-hustle/commit/<mã>`), hoặc vì sao chưa push được và cần làm gì.
