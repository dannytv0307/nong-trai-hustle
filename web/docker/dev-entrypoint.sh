#!/bin/sh
# Chạy trước lệnh chính của container server/client (môi trường DEV).
# node_modules nằm trong volume Docker riêng (bản Linux). Nếu package-lock.json đã đổi so với
# lần cài trước (vd. vừa thêm thư viện), container server cài lại; container client chờ.
set -e
cd /app

want=$(sha256sum package-lock.json | cut -d' ' -f1)
have=$(cat node_modules/.docker-lock-hash 2>/dev/null || true)

if [ "$want" != "$have" ]; then
  if [ "${BPH_INSTALL_DEPS:-0}" = "1" ]; then
    echo "[dev-entrypoint] package-lock.json đã đổi -> cài lại thư viện (npm ci)..."
    # Xóa nội dung (không xóa được chính thư mục vì nó là điểm gắn volume).
    for d in node_modules server/node_modules client/node_modules e2e/node_modules shared/node_modules; do
      [ -d "$d" ] && find "$d" -mindepth 1 -maxdepth 1 -exec rm -rf {} + || true
    done
    npm ci --no-audit --no-fund
    echo "$want" > node_modules/.docker-lock-hash
  else
    echo "[dev-entrypoint] Đang chờ container server cài xong thư viện..."
    i=0
    while [ "$(cat node_modules/.docker-lock-hash 2>/dev/null || true)" != "$want" ]; do
      i=$((i + 1))
      if [ "$i" -gt 300 ]; then echo "[dev-entrypoint] Quá lâu, dừng." >&2; exit 1; fi
      sleep 2
    done
  fi
fi

exec "$@"
