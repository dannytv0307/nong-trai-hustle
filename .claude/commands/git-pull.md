---
description: Kéo code mới nhất từ GitHub (origin) về máy một cách an toàn, không làm mất thay đổi đang dở
argument-hint: "[nhánh tuỳ chọn, mặc định nhánh hiện tại]"
allowed-tools: Bash(git status*), Bash(git diff*), Bash(git log*), Bash(git fetch*), Bash(git pull*), Bash(git branch*), Bash(git rev-parse*), Bash(git config*), Bash(git stash list*), Bash(docker compose ps*), Read, Grep, Glob
---

# /git-pull — Kéo code mới về

Yêu cầu kèm theo: $ARGUMENTS

## Luật bắt buộc (người dùng đã chốt)

1. **Không làm mất việc đang dở**: không `reset --hard`, không `checkout -- .`, không `clean`, không `stash drop`. Không tự `git stash` khi chưa hỏi người dùng.
2. **Không force, không sửa lịch sử** (rebase lại commit đã có trên GitHub, `push --force`…) trừ khi người dùng yêu cầu rõ.
3. Lệnh này **chỉ kéo về, không push**. Commit mới (nếu cần, ví dụ commit merge) phải có tác giả **duy nhất `vudzai <vudzai@users.noreply.github.com>`** và **không có dòng `Co-Authored-By`** hay ghi công nào.
4. Không đọc/in `.env` hay bí mật nào, kể cả khi file đó bị xung đột.

## Cách làm

1. Kiểm danh tính repo: `git config user.name` = `vudzai`, `user.email` = `vudzai@users.noreply.github.com`; sai thì đặt lại (cấu hình repo).
2. `git status --short` — có thay đổi chưa commit:
   - Nếu có, liệt kê ngắn gọn và hỏi người dùng (AskUserQuestion): **Commit trước rồi kéo (Đề xuất)** → làm theo `/git-commit` (không push) rồi tiếp; **Cất tạm (stash) rồi kéo, kéo xong lấy lại**; **Huỷ**.
3. `git fetch origin`, rồi so sánh nhánh hiện tại (hoặc nhánh trong `$ARGUMENTS`) với `origin/<nhánh>`:
   - Đã mới nhất → báo "đã là bản mới nhất" và dừng.
   - Chỉ phía GitHub có commit mới → `git pull --ff-only origin <nhánh>`.
   - Cả hai phía đều có commit riêng (lệch nhau) → **dừng lại, không tự merge/rebase**. Giải thích bằng lời dễ hiểu (máy có X commit chưa lên GitHub, GitHub có Y commit máy chưa có), liệt kê tác giả các commit phía GitHub (`git log --format='%h %an %s' HEAD..origin/<nhánh>`) và hỏi người dùng: **Gộp (merge) (Đề xuất)** / **Xếp commit của máy lên sau (rebase, chỉ khi commit máy chưa push)** / **Huỷ**.
   - Xung đột khi gộp → liệt kê file xung đột, giải thích ngắn, đề xuất cách gộp từng file; chỉ sửa khi người dùng đồng ý.
4. Nếu đã cất tạm ở bước 2 → `git stash pop`; xung đột thì báo người dùng, không xoá stash.
5. Sau khi kéo, xem các file đổi (`git diff --stat ORIG_HEAD HEAD` nếu có) và nhắc việc cần làm:
   - `web/package-lock.json` đổi → chạy `npm run restart` ở `web/` (container tự `npm ci`); chạy ngoài Docker thì `npm install` ở `web/`.
   - `web/server/prisma/migrations/` đổi → server trong Docker tự `migrate deploy` khi khởi động lại (`npm run restart`).
   - `web/shared/` đổi → `npm run build -w @bph/shared` nếu chạy test/build ngoài Docker.
   - `web/Dockerfile.dev` / `docker-compose.yml` đổi → `npm run up` (có `--build`).
   - `web/server/.env.example` đổi → nhắc người dùng tự xem và bổ sung biến mới vào `web/server/.env` (không đọc file `.env`).
6. Thấy commit mới từ GitHub có tác giả khác `vudzai` → chỉ báo cho người dùng biết, không tự sửa lịch sử.

## Báo lại người dùng (ngắn gọn, tiếng Việt)

- Kéo về được bao nhiêu commit (vài dòng tiêu đề), hay đã mới nhất.
- Việc cần làm thêm sau khi kéo (nếu có).
- Thay đổi đang dở vẫn còn nguyên (hoặc đã commit/stash thế nào).
