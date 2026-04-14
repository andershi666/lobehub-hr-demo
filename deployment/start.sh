#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║              HR AI 系统一键启动脚本                              ║
# ║  执行顺序：环境检查 → Docker 启动 → 等待就绪 → 注入 HR Agents       ║
# ╚══════════════════════════════════════════════════════════════╝
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 颜色输出 ─────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; }
log_step()    { echo -e "\n${BOLD}${BLUE}━━ $* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# ── Banner ──────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${BLUE}"
cat << 'EOF'
 ██╗  ██╗██████╗      █████╗ ██╗
 ██║  ██║██╔══██╗    ██╔══██╗██║
 ███████║██████╔╝    ███████║██║
 ██╔══██║██╔══██╗    ██╔══██║██║
 ██║  ██║██║  ██║    ██║  ██║██║
 ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝
  专属 HR 智能体系统
EOF
echo -e "${NC}"

# ── 步骤 1：环境检查 ─────────────────────────────────────────
log_step "步骤 1：环境检查"

# 检查 Docker
if ! command -v docker &>/dev/null; then
  log_error "未找到 Docker，请先安装：https://docs.docker.com/get-docker/"
  exit 1
fi
log_ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"

# 检查 Docker Compose
if ! docker compose version &>/dev/null; then
  log_error "未找到 Docker Compose v2，请升级 Docker"
  exit 1
fi
log_ok "Docker Compose $(docker compose version --short)"

# 检查 Node.js（seed 脚本需要）
if ! command -v node &>/dev/null; then
  log_warn "未找到 Node.js，Agent 自动注入将跳过（可后续手动运行 scripts/seed.js）"
  NODE_AVAILABLE=false
else
  log_ok "Node.js $(node --version)"
  NODE_AVAILABLE=true
fi

# ── 步骤 2：环境变量配置 ─────────────────────────────────────
log_step "步骤 2：环境变量配置"

if [ ! -f ".env" ]; then
  log_warn ".env 文件不存在，从模板复制..."
  cp .env.example .env

  # 自动生成 AUTH_SECRET
  if command -v openssl &>/dev/null; then
    AUTH_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|REPLACE_WITH_32_CHAR_RANDOM_STRING_HERE_xxxx|${AUTH_SECRET}|g" .env
    else
      sed -i "s|REPLACE_WITH_32_CHAR_RANDOM_STRING_HERE_xxxx|${AUTH_SECRET}|g" .env
    fi
    log_ok "AUTH_SECRET 已自动生成"
  fi

  echo ""
  log_warn "请编辑 .env 文件，填入以下必填项："
  echo -e "  ${YELLOW}→ ANTHROPIC_API_KEY${NC}  （或 OPENAI_API_KEY）"
  echo ""
  read -p "填好后按 Enter 继续，或 Ctrl+C 退出先去配置..."
fi

# 检查 API Key
source .env 2>/dev/null || true
if [ -z "${ANTHROPIC_API_KEY:-}" ] && [ -z "${OPENAI_API_KEY:-}" ]; then
  log_warn "未检测到 AI API Key，系统可能无法正常使用 AI 功能"
  log_warn "请在 .env 中配置 ANTHROPIC_API_KEY 或 OPENAI_API_KEY"
  echo ""
  read -p "确认继续？(y/N) " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi
log_ok "环境变量已加载"

# ── 步骤 3：创建数据目录 ──────────────────────────────────────
log_step "步骤 3：创建数据目录"
mkdir -p data/postgresql data/redis data/rustfs logs
log_ok "数据目录已就绪"

# ── 步骤 4：启动 Docker 服务 ──────────────────────────────────
log_step "步骤 4：启动 Docker 服务"

log_info "拉取最新镜像..."
docker compose pull --quiet 2>/dev/null || true

log_info "启动服务..."
docker compose up -d

echo ""
log_info "等待服务就绪（约 30-60 秒）..."

# 等待 LobeHub 健康检查通过
MAX_WAIT=120
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' hr-lobehub 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    break
  fi
  printf "  ⏳ 等待中 (%ds)...\r" $ELAPSED
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

if [ "$STATUS" != "healthy" ]; then
  log_warn "LobeHub 健康检查超时，服务可能仍在启动中"
  log_info "查看日志：docker logs -f hr-lobehub"
else
  log_ok "所有服务已就绪！"
fi

# ── 步骤 5：注入 HR Agents ────────────────────────────────────
log_step "步骤 5：注入 HR Agents"

if [ "$NODE_AVAILABLE" = true ]; then
  SCRIPTS_DIR="$SCRIPT_DIR/scripts"

  # 安装依赖
  if [ ! -d "$SCRIPTS_DIR/node_modules" ]; then
    log_info "安装 seed 脚本依赖..."
    cd "$SCRIPTS_DIR" && npm install --silent && cd "$SCRIPT_DIR"
  fi

  log_info "运行 Agent 注入脚本..."
  echo ""
  source .env 2>/dev/null || true
  DB_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/${LOBE_DB_NAME}"
  DATABASE_URL="$DB_URL" node "$SCRIPTS_DIR/seed.js"
else
  log_warn "Node.js 不可用，跳过自动注入"
  log_info "安装 Node.js 后手动运行："
  log_info "  cd scripts && npm install && node seed.js"
fi

# ── 完成 ──────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║         🎉 HR AI 系统启动完成！                ║"
echo "  ╠══════════════════════════════════════════════╣"
echo -e "  ║  🌐 系统入口：${CYAN}http://localhost:3210${GREEN}         ║"
echo -e "  ║  🗄️  S3 控制台：${CYAN}http://localhost:9001${GREEN}       ║"
echo "  ╠══════════════════════════════════════════════╣"
echo "  ║  首次使用请注册管理员账号                         ║"
echo "  ║  注册后即可看到 8 个预置 HR Agent               ║"
echo "  ╚══════════════════════════════════════════════╝"
echo -e "${NC}"

log_info "常用命令："
echo "  查看日志：  docker logs -f hr-lobehub"
echo "  停止服务：  ./stop.sh"
echo "  重新注入：  cd scripts && node seed.js"
