#!/bin/bash
# ============================================================
# shop-server 启动脚本
# 目录约定：bin/ 启停脚本  conf/ 外部配置  lib/ 应用jar  logs/ 日志
# 可用环境变量覆盖：JAVA_OPTS、JAVA_HOME
# ============================================================
set -e

APP_NAME="shop-server"
APP_HOME="$(cd "$(dirname "$0")/.." && pwd)"
JAR="$APP_HOME/lib/${APP_NAME}.jar"
CONF_DIR="$APP_HOME/conf"
LOG_DIR="$APP_HOME/logs"
PID_FILE="$APP_HOME/bin/${APP_NAME}.pid"

# 默认 JVM 参数（G1、OOM dump、UTF-8、时区）
JAVA_OPTS="${JAVA_OPTS:--Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=$LOG_DIR -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai}"

# 外部配置目录（additional-location 优先级高于 jar 内 application.properties）
SPRING_CONFIG_ADDITIONAL_LOCATION="file:${CONF_DIR}/"

JAVA_BIN="java"
if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
  JAVA_BIN="$JAVA_HOME/bin/java"
fi

if [ ! -f "$JAR" ]; then
  echo "[ERROR] 未找到应用包：$JAR"
  exit 1
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "[WARN] ${APP_NAME} 已在运行 (pid=$(cat "$PID_FILE"))，请先 stop"
  exit 1
fi

mkdir -p "$LOG_DIR"

# 存在 conf/ 外部 logback 则覆盖 jar 内默认
LOGBACK_CONF=""
if [ -f "$CONF_DIR/logback-spring.xml" ]; then
  LOGBACK_CONF="--logging.config=file:$CONF_DIR/logback-spring.xml"
fi

nohup "$JAVA_BIN" $JAVA_OPTS \
  -DLOG_PATH="$LOG_DIR" \
  -jar "$JAR" \
  --spring.config.additional-location="$SPRING_CONFIG_ADDITIONAL_LOCATION" \
  $LOGBACK_CONF \
  > "$LOG_DIR/console.log" 2>&1 &

echo $! > "$PID_FILE"

echo "[OK] ${APP_NAME} 已启动 (pid=$(cat "$PID_FILE"))"
echo "     conf=$CONF_DIR  logs=$LOG_DIR"
