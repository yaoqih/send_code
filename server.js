const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { pool, initDatabase } = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 存储当前验证码
let currentCode = generateRandomCode();
let lastCodeChangeTime = Date.now();
const CODE_REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟刷新一次

// 已使用的设备指纹
const usedFingerprints = new Set();

// 生成随机验证码
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 定时刷新验证码
setInterval(() => {
    currentCode = generateRandomCode();
    lastCodeChangeTime = Date.now();
    console.log(`验证码已更新: ${currentCode}`);
}, CODE_REFRESH_INTERVAL);

// 从数据库获取可用邀请码
async function getAvailableInviteCode() {
    try {
        const [rows] = await pool.execute(
            'SELECT code FROM invitation_code WHERE is_used = FALSE LIMIT 1'
        );
        
        if (rows.length === 0) {
            return null;
        }
        
        return rows[0].code;
    } catch (error) {
        console.error('获取邀请码失败:', error);
        return null;
    }
}

// 标记邀请码为已使用
async function markInviteCodeAsUsed(code, fingerprint) {
    try {
        const [result] = await pool.execute(
            'UPDATE invitation_code SET is_used = TRUE, updated_at = NOW(), used_by = ? WHERE code = ? AND is_used = FALSE',
            [fingerprint, code]
        );
        
        return result.affectedRows > 0;
    } catch (error) {
        console.error('标记邀请码失败:', error);
        return false;
    }
}

// 获取剩余邀请码数量
async function getRemainingInviteCodesCount() {
    try {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM invitation_code WHERE is_used = FALSE'
        );
        
        return rows[0].count;
    } catch (error) {
        console.error('获取剩余邀请码数量失败:', error);
        return 0;
    }
}

// 获取已使用邀请码数量
async function getUsedInviteCodesCount() {
    try {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM invitation_code WHERE is_used = TRUE'
        );
        
        return rows[0].count;
    } catch (error) {
        console.error('获取已使用邀请码数量失败:', error);
        return 0;
    }
}

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 管理端API - 获取当前验证码
app.get('/api/admin/code', (req, res) => {
    const timeLeft = CODE_REFRESH_INTERVAL - (Date.now() - lastCodeChangeTime);
    res.json({
        code: currentCode,
        refreshIn: Math.ceil(timeLeft / 1000)
    });
});

// 管理端API - 获取剩余邀请码数量
app.get('/api/admin/stats', async (req, res) => {
    try {
        const remaining = await getRemainingInviteCodesCount();
        const used = await getUsedInviteCodesCount();
        
        res.json({
            remaining,
            used
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({ success: false, message: '获取统计信息失败' });
    }
});

// 用户端API - 验证并获取邀请码
app.post('/api/verify', async (req, res) => {
    try {
        const { inputCode, fingerprint } = req.body;
        
        console.log('收到验证请求:', { inputCode, fingerprint: fingerprint ? fingerprint.substring(0, 8) + '...' : '无指纹' });
        
        // 验证请求数据
        if (!inputCode || !fingerprint) {
            console.warn('请求数据不完整:', { inputCode: !!inputCode, fingerprint: !!fingerprint });
            return res.status(400).json({ success: false, message: '请求数据不完整' });
        }
        
        // 验证输入的验证码
        if (inputCode !== currentCode) {
            console.log('验证码不匹配:', { input: inputCode, current: currentCode });
            return res.status(400).json({ success: false, message: '验证码不正确' });
        }
        
        // 检查设备是否已领取
        if (usedFingerprints.has(fingerprint)) {
            console.log('设备已领取过:', fingerprint.substring(0, 8) + '...');
            return res.status(400).json({ success: false, message: '您已领取过邀请码' });
        }
        
        // 获取可用邀请码
        const inviteCode = await getAvailableInviteCode();
        if (!inviteCode) {
            console.warn('邀请码已用完');
            return res.status(400).json({ success: false, message: '邀请码已发放完毕' });
        }
        
        // 标记邀请码为已使用
        const marked = await markInviteCodeAsUsed(inviteCode, fingerprint);
        if (!marked) {
            console.error('标记邀请码失败:', inviteCode);
            return res.status(500).json({ success: false, message: '处理邀请码失败' });
        }
        
        // 记录设备指纹
        usedFingerprints.add(fingerprint);
        console.log(`成功发放邀请码 ${inviteCode} 给设备 ${fingerprint.substring(0, 8)}...`);
        
        // 返回邀请码
        res.json({
            success: true,
            inviteCode
        });
    } catch (error) {
        console.error('处理验证请求时出错:', error);
        res.status(500).json({ success: false, message: '服务器处理请求失败' });
    }
});

// 添加一个测试端点，用于检查服务器状态
app.get('/api/status', async (req, res) => {
    try {
        const remaining = await getRemainingInviteCodesCount();
        const used = await getUsedInviteCodesCount();
        
        res.json({
            status: 'running',
            currentTime: new Date().toISOString(),
            codeAge: Math.floor((Date.now() - lastCodeChangeTime) / 1000) + '秒',
            inviteCodesRemaining: remaining,
            usedDevices: usedFingerprints.size,
            usedInviteCodes: used
        });
    } catch (error) {
        console.error('获取状态信息失败:', error);
        res.status(500).json({ success: false, message: '获取状态信息失败' });
    }
});

// 初始化数据库并启动服务器
async function startServer() {
    try {
        // 初始化数据库连接
        await initDatabase();
        
        // 启动服务器
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
            console.log(`管理端: http://0.0.0.0:${PORT}/admin.html`);
            console.log(`用户端: http://0.0.0.0:${PORT}`);
            console.log(`当前验证码: ${currentCode}`);
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

// 启动服务器
startServer(); 