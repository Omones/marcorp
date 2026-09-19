(function() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    // Адаптация размеров строго под родительский контейнер
    let w = canvas.width = parent.clientWidth;
    let h = canvas.height = parent.clientHeight;

    const config = {
        linesCount: 40,          // Количество нитей в жгуте
        segments: 100,           // Детализация изгибов
        amplitude: 110,          // Базовая высота изгиба волны
        speed: 0.005,            // Скорость движения
        waveColor: 'rgba(95, 10, 20, 0.08)' // Строгий бордовый
    };

    const mouse = { x: w / 2, y: h / 2, targetX: w / 2, targetY: h / 2 };

    // Слушатель движения мыши привязан к родительскому блоку
    parent.addEventListener('mousemove', (e) => {
        const rect = parent.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
    });

    parent.addEventListener('mouseleave', () => {
        mouse.targetX = w / 2;
        mouse.targetY = h / 2;
    });

    // Светлая космическая пыль
    const particles = [];
    for(let i = 0; i < 45; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.0 + 0.3,
            speedX: Math.random() * 0.2 - 0.1,
            speedY: Math.random() * -0.2 - 0.05,
            alpha: Math.random() * 0.4 + 0.1
        });
    }

    // Отслеживание изменения размеров именно родительского блока
    const resizeObserver = new ResizeObserver(() => {
        w = canvas.width = parent.clientWidth;
        h = canvas.height = parent.clientHeight;
    });
    resizeObserver.observe(parent);

    let phase = 0;

    function animate() {
        // Очищаем кадр с эффектом прозрачного шлейфа (используем прозрачный черный слой)
        // Чтобы шлейф не забивал фоновый цвет родителя, применяется метод очистки кадра
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.globalCompositeOperation = 'screen';
        phase += config.speed;

        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // 1. Рассеянное бордовое свечение сверху внутри блока
        let topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        topGrad.addColorStop(0, 'rgba(80, 8, 15, 0.15)'); 
        topGrad.addColorStop(0.5, 'rgba(40, 4, 8, 0.03)');
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, w, h * 0.6);

        // Динамические фоновые колыхания тумана
        for (let i = 0; i < 3; i++) {
            let shift = Math.sin(phase * 0.3 + i * 1.5) * (w * 0.1);
            let posX = (w * 0.25) + (i * w * 0.25) + shift;
            
            let spotGrad = ctx.createRadialGradient(posX, 0, 0, posX, 0, w * 0.25);
            spotGrad.addColorStop(0, 'rgba(90, 8, 16, 0.06)');
            spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = spotGrad;
            ctx.fillRect(posX - w * 0.25, 0, w * 0.5, h * 0.5);
        }

        // 2. Частицы пыли
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < 0) p.y = h;
            if (p.x < 0 || p.x > w) p.x = Math.random() * w;
            
            let waveAlpha = p.alpha * (Math.sin(phase * 2 + p.x * 0.01) * 0.3 + 0.7);
            ctx.fillStyle = `rgba(210, 215, 225, ${waveAlpha})`; 
            ctx.fillRect(p.x, p.y, p.r * 1.5, p.r * 1.5);
        });

        // 3. Жгут волны с интерактивным эффектом
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = config.waveColor;

        for (let i = 0; i < config.linesCount; i++) {
            ctx.beginPath();
            let lineShift = i * 0.08 + Math.sin(i * 0.5) * 0.2; 
            
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

                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(animate);
    }

    animate();
})();
