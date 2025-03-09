// 添加服务器URL配置
const SERVER_URL = window.location.origin; // 自动获取当前服务器地址

document.addEventListener('DOMContentLoaded', () => {
    const codeElement = document.getElementById('verification-code');
    const timeProgressElement = document.getElementById('time-progress');
    const timeLeftElement = document.getElementById('time-left');
    const remainingCodesElement = document.getElementById('remaining-codes');
    const usedCodesElement = document.getElementById('used-codes');
    
    let refreshInterval = 5 * 60; // 默认5分钟刷新
    let timeLeft = refreshInterval;
    let timer;
    
    // 格式化时间为 MM:SS 格式
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 更新进度条和倒计时
    function updateTimer() {
        if (timeLeft <= 0) {
            fetchVerificationCode();
            return;
        }
        
        const percentage = (timeLeft / refreshInterval) * 100;
        timeProgressElement.style.width = `${percentage}%`;
        timeLeftElement.textContent = formatTime(timeLeft);
        timeLeft--;
    }
    
    // 获取当前验证码
    async function fetchVerificationCode() {
        try {
            const response = await fetch(`${SERVER_URL}/api/admin/code`);
            const data = await response.json();
            
            codeElement.textContent = data.code;
            refreshInterval = data.refreshIn;
            timeLeft = refreshInterval;
            
            // 重置并启动计时器
            clearInterval(timer);
            timer = setInterval(updateTimer, 1000);
            updateTimer();
        } catch (error) {
            console.error('获取验证码失败:', error);
            codeElement.textContent = '错误';
        }
    }
    
    // 获取统计数据
    async function fetchStats() {
        try {
            const response = await fetch(`${SERVER_URL}/api/admin/stats`);
            const data = await response.json();
            
            remainingCodesElement.textContent = data.remaining;
            usedCodesElement.textContent = data.used;
        } catch (error) {
            console.error('获取统计数据失败:', error);
        }
    }
    
    // 初始化
    fetchVerificationCode();
    fetchStats();
    
    // 定期更新统计数据
    setInterval(fetchStats, 10000); // 每10秒更新一次
}); 