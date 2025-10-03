// 1. 新增：动态生成桂花飘落效果
function createOsmanthus() {
    const container = document.getElementById('osmanthusContainer');
    const count = 15; // 桂花粒子数量
    
    for (let i = 0; i < count; i++) {
        const osmanthus = document.createElement('span');
        // 随机位置与动画参数
        osmanthus.style.left = `${Math.random() * 100}%`;
        osmanthus.style.top = `${-Math.random() * 50}px`; // 从顶部外开始
        osmanthus.style.animationDuration = `${5 + Math.random() * 7}s`; // 5-12秒
        osmanthus.style.animationDelay = `${Math.random() * 3}s`; // 0-3秒延迟
        container.appendChild(osmanthus);

        // 粒子落地后重置位置（循环动画）
        setTimeout(() => {
            setInterval(() => {
                osmanthus.style.left = `${Math.random() * 100}%`;
                osmanthus.style.top = `${-Math.random() * 50}px`;
            }, parseFloat(osmanthus.style.animationDuration) * 1000);
        }, parseFloat(osmanthus.style.animationDelay) * 1000);
    }
}

// 2. 文字点击播放音乐（保留原有逻辑，优化提示）
const textGroup = document.querySelector('.text-group');
const bgm = document.getElementById('bgm');
const musicTip = document.querySelector('.tip');

// 创建悬浮提示（替代alert，不阻塞交互）
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 15px 25px;
        background: rgba(0,0,0,0.8);
        color: white;
        border-radius: 8px;
        z-index: 100;
        font-size: 16px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = 1, 10);
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
};

textGroup.addEventListener('click', () => {
    if (bgm.paused) {
        bgm.play().catch(err => {
            showToast('请先点击页面再播放音乐');
        });
        showToast('中秋团圆，国庆快乐！\n愿山河无恙，人间皆安～');
        musicTip.textContent = '点击文字暂停音乐 | 点击圆月看烟花';
    } else {
        bgm.pause();
        musicTip.textContent = '点击文字播放音乐 | 点击圆月看烟花';
    }
});

// 页面关闭时停止音频
window.addEventListener('beforeunload', () => {
    if (!bgm.paused) bgm.pause();
});

// 3. 月亮点击放烟花（完全保留原有逻辑）
const moon = document.querySelector('.moon');
const card = document.querySelector('.card');
const fireworkSound = document.getElementById('fireworkSound');

// 粒子池配置
let particlePool = [];
const MAX_PARTICLES = 120;
const isMobile = window.innerWidth < 768;
const particleCountPerClick = isMobile ? 15 : 20;

// 初始化粒子池
function initParticlePool() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${isMobile ? 6 : 8}px;
            height: ${isMobile ? 6 : 8}px;
            opacity: 0;
            z-index: 10;
            transition: opacity 0.3s ease;
            background-image: none;
        `;
        card.appendChild(particle);
        particlePool.push(particle);
    }
}

// 重置粒子样式
function resetParticleStyle(particle) {
    particle.style.cssText = `
        position: absolute;
        width: ${isMobile ? 6 : 8}px;
        height: ${isMobile ? 6 : 8}px;
        opacity: 0;
        z-index: 10;
        transition: opacity 0.3s ease;
        background-image: none;
    `;
}

// 获取可用粒子
function getAvailableParticle() {
    const available = particlePool.find(p => 
        p.style.opacity === '0' && !p.style.backgroundImage
    );
    if (available) {
        resetParticleStyle(available);
        return available;
    } else {
        const newParticle = document.createElement('div');
        resetParticleStyle(newParticle);
        card.appendChild(newParticle);
        particlePool.push(newParticle);
        return newParticle;
    }
}

// 粒子运动逻辑
function moveParticle(particle, moonCenterX, moonCenterY) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    const lifetime = 1500 + Math.random() * 1000;
    let x = 0;
    let y = 0;
    const startTime = Date.now();

    function updatePosition() {
        const elapsed = Date.now() - startTime;
        if (elapsed > lifetime) {
            setTimeout(() => {
                particle.style.opacity = '0';
                particle.style.backgroundImage = 'none';
            }, 300);
            return;
        }
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed + (elapsed / 500);
        particle.style.left = `${moonCenterX + x}px`;
        particle.style.top = `${moonCenterY + y}px`;
        requestAnimationFrame(updatePosition);
    }
    updatePosition();
}

// 点击月亮生成烟花
moon.addEventListener('click', () => {
    if (fireworkSound) {
        fireworkSound.currentTime = 0;
        fireworkSound.play().catch(err => console.log('烟花音效播放失败：', err));
    }
    const moonRect = moon.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const moonCenterX = moonRect.left - cardRect.left + moonRect.width / 2;
    const moonCenterY = moonRect.top - cardRect.top + moonRect.height / 2;

    for (let i = 0; i < particleCountPerClick; i++) {
        const particle = getAvailableParticle();
        if (!particle) break;
        // 随机颜色（国庆红、中秋金等）
        const colors = [
            ['#C91F37', '#E63946'],
            ['#FFD700', '#FFE569'],
            ['#1E3A8A', '#3B82F6']
        ];
        const colorSet = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundImage = `linear-gradient(45deg, ${colorSet[0]}, ${colorSet[1]})`;
        // 随机形状
        const shapes = [
            'border-radius: 50%;',
            'border-radius: 0;',
            'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);'
        ];
        particle.style.cssText += shapes[Math.floor(Math.random() * shapes.length)];
        // 显示并运动
        particle.style.left = `${moonCenterX}px`;
        particle.style.top = `${moonCenterY}px`;
        particle.style.opacity = '1';
        moveParticle(particle, moonCenterX, moonCenterY);
    }
});

// 页面加载时初始化所有效果
window.addEventListener('load', () => {
    createOsmanthus(); // 初始化桂花
    initParticlePool(); // 初始化烟花粒子池
});
    