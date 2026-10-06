#!/bin/bash
# ============================================================
# shop 构建脚本（后端发布包 + 前端静态资源）
# 用法：./build.sh [profile] [target]
#   profile  dev|sit|prod（后端 Maven profile，决定 spring.profiles.active），可空
#   target   all(默认) | backend | frontend
# 产物：shop-web/shop-server/target/shop-server-<版本>.tar.gz、shop-ui/dist/
# ============================================================
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/shop-web"
UI_DIR="$ROOT_DIR/shop-ui"

PROFILE="${1:-}"
TARGET="${2:-all}"

case "$TARGET" in
  all|backend|frontend) ;;
  *) echo "[ERROR] target 只能是 all|backend|frontend"; exit 2 ;;
esac

if [ "$TARGET" = "all" ] || [ "$TARGET" = "backend" ]; then
  MVN_ARGS=(clean package -DskipTests)
  if [ -n "$PROFILE" ]; then
    MVN_ARGS+=(-P"$PROFILE")
  fi
  echo "[INFO] 后端: mvn ${MVN_ARGS[*]}"
  ( cd "$BACKEND_DIR" && mvn "${MVN_ARGS[@]}" )
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "frontend" ]; then
  echo "[INFO] 前端: pnpm install + build"
  ( cd "$UI_DIR" && pnpm install --frozen-lockfile --config.strict-dep-builds=false && pnpm build )
fi

echo ""
echo "[OK] 构建完成："
if [ "$TARGET" = "all" ] || [ "$TARGET" = "backend" ]; then
  ls -lh "$BACKEND_DIR"/shop-server/target/shop-server-*.tar.gz 2>/dev/null || true
fi
if [ "$TARGET" = "all" ] || [ "$TARGET" = "frontend" ]; then
  du -sh "$UI_DIR/dist" 2>/dev/null || true
fi
