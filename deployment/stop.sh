#!/usr/bin/env bash
# HR AI 系统停止脚本
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "🛑 停止 HR AI 系统..."
docker compose down
echo "✅ 所有服务已停止"
echo ""
echo "提示：数据已保留在 ./data 目录，重新运行 ./start.sh 可恢复"
