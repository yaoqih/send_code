document.addEventListener('DOMContentLoaded', async () => {
    // 添加服务器URL配置
    const SERVER_URL = window.location.origin; // 自动获取当前服务器地址
    
    const inputCard = document.getElementById('input-card');
    const resultCard = document.getElementById('result-card');
    const verificationInput = document.getElementById('verification-input');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');
    const inviteCodeElement = document.getElementById('invite-code');
    
    let deviceFingerprint = '';
    
    // 初始化设备指纹
    async function initFingerprint() {
        try {
            // 检查FingerprintJS是否正确加载
            if (typeof FingerprintJS === 'undefined') {
                // 如果库未加载，使用备用方案
                console.warn('FingerprintJS未加载，使用备用方案');
                deviceFingerprint = generateFallbackFingerprint();
                return;
            }
            
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            deviceFingerprint = result.visitorId;
            console.log('设备指纹已生成:', deviceFingerprint);
        } catch (error) {
            console.error('生成设备指纹失败:', error);
            // 使用备用方案
            deviceFingerprint = generateFallbackFingerprint();
        }
    }
    
    // 备用指纹生成方法
    function generateFallbackFingerprint() {
        // 使用浏览器信息和随机数生成简单指纹
        const userAgent = navigator.userAgent;
        const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
        const timeZone = new Date().getTimezoneOffset();
        const language = navigator.language;
        const cookieEnabled = navigator.cookieEnabled;
        
        // 生成随机ID并存储在localStorage中
        let storedId = localStorage.getItem('device_id');
        if (!storedId) {
            storedId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
            localStorage.setItem('device_id', storedId);
        }
        
        // 组合信息生成指纹
        const fingerprint = btoa(
            `${userAgent}|${screenInfo}|${timeZone}|${language}|${cookieEnabled}|${storedId}`
        ).replace(/=/g, '').substring(0, 32);
        
        console.log('使用备用指纹:', fingerprint);
        return fingerprint;
    }
    
    // 验证并获取邀请码
    async function verifyAndGetCode() {
        const inputCode = verificationInput.value.trim();
        
        // 验证输入
        if (!inputCode) {
            errorMessage.textContent = '请输入验证码';
            return;
        }
        
        if (inputCode.length !== 6 || !/^\d+$/.test(inputCode)) {
            errorMessage.textContent = '请输入6位数字验证码';
            return;
        }
        
        if (!deviceFingerprint) {
            // 如果指纹仍然为空，尝试再次生成
            deviceFingerprint = generateFallbackFingerprint();
        }
        
        // 显示加载状态
        submitBtn.disabled = true;
        submitBtn.textContent = '处理中...';
        errorMessage.textContent = '';
        
        try {
            const response = await fetch(`${SERVER_URL}/api/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputCode,
                    fingerprint: deviceFingerprint
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // 显示成功结果
                inviteCodeElement.textContent = data.inviteCode;
                inputCard.classList.add('hidden');
                resultCard.classList.remove('hidden');
                
                // 保存到本地存储，防止刷新后丢失
                localStorage.setItem('inviteCode', data.inviteCode);
                localStorage.setItem('hasReceived', 'true');
            } else {
                // 显示错误信息
                errorMessage.textContent = data.message || '验证失败，请重试';
                submitBtn.disabled = false;
                submitBtn.textContent = '提交';
            }
        } catch (error) {
            console.error('请求失败:', error);
            errorMessage.textContent = '网络错误，请重试';
            submitBtn.disabled = false;
            submitBtn.textContent = '提交';
        }
    }
    
    // 检查是否已经领取过
    function checkPreviousCode() {
        const hasReceived = localStorage.getItem('hasReceived');
        const savedCode = localStorage.getItem('inviteCode');
        
        if (hasReceived === 'true' && savedCode) {
            inviteCodeElement.textContent = savedCode;
            inputCard.classList.add('hidden');
            resultCard.classList.remove('hidden');
        }
    }
    
    // 初始化
    try {
        await initFingerprint();
    } catch (error) {
        console.error('初始化失败，使用备用方案:', error);
        deviceFingerprint = generateFallbackFingerprint();
    }
    
    checkPreviousCode();
    
    // 事件监听
    submitBtn.addEventListener('click', verifyAndGetCode);
    
    // 回车键提交
    verificationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyAndGetCode();
        }
    });
}); 