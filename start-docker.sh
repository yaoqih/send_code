#!/bin/bash

# 从.env文件加载环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "错误: .env 文件不存在"
  exit 1
fi

# 检查必要的环境变量
required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "DB_PORT")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "错误: 缺少必要的环境变量: ${missing_vars[*]}"
  exit 1
fi

# 构建并启动Docker容器
echo "正在启动Docker容器..."
docker-compose up -d --build

echo "容器已启动，可以通过 http://localhost:3000 访问应用" 