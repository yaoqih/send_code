# 展会体验码发放系统

一个简单但功能完善的展会体验码发放系统，用于在展会现场向参观者发放体验码。

## 功能特点

- 管理端实时显示动态验证码，每5分钟自动刷新
- 用户扫码后输入验证码获取专属体验码
- 通过设备指纹识别防止重复领取
- 简洁美观的界面设计，支持移动端
- 无需数据库，直接从CSV文件读取体验码

## 使用方法

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm start
```

或者开发模式（自动重启）：

```bash
npm run dev
```

### 访问方式

- 管理端：http://localhost:3000/admin.html
- 用户端：http://localhost:3000/

## 部署说明

1. 将邀请码保存在项目根目录的`邀请码.csv`文件中，每行一个
2. 可以修改`server.js`中的`CODE_REFRESH_INTERVAL`变量调整验证码刷新频率
3. 部署到服务器时，建议使用PM2等工具管理Node.js进程

## 注意事项

- 本系统使用浏览器指纹技术防止重复领取，但并非100%可靠
- 建议在展会现场使用，并配合工作人员监督
- 验证码应当只在现场展示，不要通过网络传播