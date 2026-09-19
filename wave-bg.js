(function() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    let w = canvas.width = parent.clientWidth;
    let h = canvas.height = parent.clientHeight;

    const config = {
        linesCount: 30,          // Немного уменьшили для баланса производительности
        segments: 90,            
        amplitude: 100,          
        speed: 0.006,            
        waveColor: 'rgba(95, 10, 20, 0.12)', // Бордовый цвет нитей
        trailLength: 6           // Длина эффекта шлейфа (кол-во кадров в памяти)
    };

    const mouse = { x: w / 2, y: h / 2, targetX: w / 2, targetY: h / 2 };

    parent.addEventListener('mousemove', (e) => {
        const rect = parent.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
    });

    parent.addEventListener('mouseleave', () => {
        mouse.targetX = w / 2;
        mouse.targetY = h / 2;
    });

    // Массив для хранения истории кадров каждой нити (замена забагованного стирания экрана)
    const linesHistory = [];
    for (let i = 0; i < config.linesCount; i++) {
        linesHistory.push([]);
    }

    // Светлая космическая пыль
    const particles = [];
    for(let i = 0; i < 35; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.0 + 0.3,
            speedX: Math.random() * 0.2 - 0.1,
            speedY: Math.random() * -0.2 - 0.05,
            alpha: Math.random() * 0.4 + 0.1
        });
    }

    const resizeObserver = new ResizeObserver(() => {
        w = canvas.width = parent.clientWidth;
        h = canvas.height = parent.clientHeight;
    });
    resizeObserver.observe(parent);

    let phase = 0;

    function animate() {
        // Честная очистка холста до полной прозрачности каждый кадр
        ctx.clearRect(0, 0, w, h);
        
        ctx.globalCompositeOperation = 'screen';
        phase += config.speed;

        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // 1. Градиент свечения сверху (тоже прозрачный, без черной подложки)
        let topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        topGrad.addColorStop(0, 'rgba(95, 10, 20, 0.12)'); 
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, w, h * 0.6);

        // 2. Отрисовка частиц
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < 0) p.y = h;
            if (p.x < 0 || p.x > w) p.x = Math.random() * w;
            
            let waveAlpha = p.alpha * (Math.sin(phase * 2 + p.x * 0.01) * 0.3 + 0.7);
            ctx.fillStyle = `rgba(95, 10, 20, ${waveAlpha})`; // Частицы теперь тоже бордовые, чтобы сочетаться с белым сайтом
            ctx.fillRect(p.x, p.y, p.r * 1.5, p.r * 1.5);
        });

        // 3. Вычисление текущего положения нитей
        for (let i = 0; i < config.linesCount; i++) {
            let lineShift = i * 0.08 + Math.sin(i * 0.5) * 0.2; 
            let currentLinePoints = [];

            for (let j = 0; j <= config.segments; j++) {
                let x = (w / config.segments) * j;
                let baseY = h * 0.53;
                
                let distToMouseX = Math.abs(x - mouse.x);
                let mouseInfluence = Math.exp(-distToMouseX / (w * 0.15));
                let mouseOffsetY = (mouse.y - baseY) * 0.25 * mouseInfluence;

                let mainWave = Math.sin(x * 0.004 - phase + lineShift);
                let modWave = Math.cos(x * 0.01 - phase * 0.6 + lineShift * 1.3);
                
                let rippleAmp = 3 + (mouseInfluence * 6);
                let microRipple = Math.sin(x * 0.04 + phase * 1.5 + (i * 0.1)) * rippleAmp;

                let currentAmp = config.amplitude * (1 + mouseInfluence * 0.2);
                let y = baseY + mouseOffsetY + (mainWave * currentAmp * modWave) + microRipple;

                let edgeFade = Math.sin((j / config.segments) * Math.PI);
                y = baseY + (y - baseY) * edgeFade;

                currentLinePoints.push({ x, y });
            }

            // Добавляем текущий кадр нити в историю и удаляем старые кадры
            linesHistory[i].push(currentLinePoints);
            if (linesHistory[i].length > config.config_trailLength || linesHistory[i].length > 6) {
                linesHistory[i].shift();
            }

            // Рендерим нить вместе с её шлейфом из истории кадров
            linesHistory[i].forEach((points, tIndex) => {
                // Чем старее кадр в истории, тем он прозрачнее — это и создает эффект плавного шлейфа!
                let alphaModifier = (tIndex + 1) / linesHistory[i].length;
                ctx.lineWidth = 1.0 * alphaModifier;
                ctx.strokeStyle = `rgba(95, 10, 20, ${0.1 * alphaModifier})`;

                ctx.beginPath();
                points.forEach((pt, pIndex) => {
                    if (pIndex === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.stroke();
            });
        }

        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(animate);
    }

    animate();
})();
