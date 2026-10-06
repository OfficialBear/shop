#!/bin/bash
# ============================================================
# shop-server 停止脚本（先优雅退出，超时后强杀）
# ============================================================
APP_NAME="shop-server"
APP_HOME="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$APP_HOME/bin/${APP_NAME}.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "[WARN] 未找到 pid 文件，${APP_NAME} 可能未运行"
  exit 0
fi

PID="$(cat "$PID_FILE")"

if kill -0 "$PID" 2>/dev/null; then
  echo "[INFO] 正在停止 ${APP_NAME} (pid=$PID) ..."
  kill "$PID"
  for _ in $(seq 1 30); do
    if ! kill -0 "$PID" 2>/dev/null; then
      break
    fi
    sleep 1
  done
  if kill -0 "$PID" 2>/dev/null; then
    echo "[WARN] 优雅退出超时，执行 kill -9"
    kill -9 "$PID"
  fi
  echo "[OK] ${APP_NAME} 已停止 (pid=$PID)"
else
  echo "[WARN] 进程不存在 (pid=$PID)"
fi

rm -f "$PID_FILE"
