# Docker 部署指南

本文档提供了如何使用 Docker 部署邀请码系统的详细说明。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

## 安全部署步骤

### 1. 准备环境变量

项目使用 `.env` 文件存储敏感配置信息。为了安全起见，我们不会将实际的 `.env` 文件包含在代码仓库中。

创建 `.env` 文件并填入以下内容（替换为实际的数据库信息）：

```
# 数据库配置
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=your_database_port
```

### 2. 使用启动脚本部署

我们提供了一个安全的启动脚本，它会从 `.env` 文件读取敏感信息并安全地传递给 Docker 容器：

```bash
# 给启动脚本添加执行权限
chmod +x start-docker.sh

# 运行启动脚本
./start-docker.sh
```

### 3. 手动部署（替代方法）

如果您不想使用启动脚本，也可以手动设置环境变量并启动容器：

```bash
# 从.env文件加载环境变量
export $(grep -v '^#' .env | xargs)

# 构建并启动容器
docker-compose up -d --build
```

### 4. 验证部署

部署完成后，您可以通过以下方式验证应用是否正常运行：

```bash
# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs -f
```

应用将在 http://服务器IP:3000 上运行，可以通过外网访问。

## 外网访问配置

本应用已配置为允许外网访问：

1. 服务器监听在 `0.0.0.0` 地址上，允许来自任何网络接口的连接
2. Docker 容器端口映射配置为 `0.0.0.0:3000:3000`，允许外部网络访问

如果您的服务器有防火墙，请确保开放 3000 端口：

```bash
# 对于使用 ufw 的系统（如 Ubuntu）
sudo ufw allow 3000/tcp

# 对于使用 firewalld 的系统（如 CentOS）
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 安全注意事项

1. **不要将 `.env` 文件提交到版本控制系统**
2. **定期更改数据库密码**
3. **限制数据库用户权限**
4. **使用网络防火墙限制数据库访问**
5. **考虑使用 HTTPS 和反向代理**：由于应用现在可以从外网访问，强烈建议配置 HTTPS 和反向代理（如 Nginx）以提高安全性

## 故障排除

如果遇到问题，请检查：

1. Docker 和 Docker Compose 是否正确安装
2. `.env` 文件是否包含所有必要的环境变量
3. 数据库是否可以从 Docker 容器访问
4. 容器日志中是否有错误信息
5. 防火墙是否允许 3000 端口的流量

## 更新应用

要更新应用，请拉取最新代码并重新运行启动脚本：

```bash
git pull
./start-docker.sh
``` 