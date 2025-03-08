const mysql = require('mysql2/promise');
require('dotenv').config();

// 检查必要的环境变量
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`缺少必要的环境变量: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 初始化数据库连接
async function initDatabase() {
  let retries = 5;
  while (retries) {
    try {
      // 测试数据库连接
      const connection = await pool.getConnection();
      console.log('数据库连接成功');
      connection.release();
      return;
    } catch (error) {
      retries -= 1;
      console.error(`数据库连接失败 (剩余尝试次数: ${retries}):`, error);
      if (retries === 0) {
        console.error('数据库连接失败次数过多，退出应用');
        process.exit(1);
      }
      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

module.exports = {
  pool,
  initDatabase
}; 