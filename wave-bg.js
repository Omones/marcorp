(function() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    let w = canvas.width = parent.clientWidth;
    let h = canvas.height = parent.clientHeight;

    const config = {
        linesCount: 32,          // Оптимальное количество для высокой плотности
        segments: 60,            // Уменьшено количество точек (визуально незаметно, но в 1.5 раза быстрее)
        amplitude: 100,          // Высота изгиба волны
        speed: 0.006,            // Скорость движения
        waveColor: 'rgba(95, 10, 20, 0.15)' // Насыщенный бордовый
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

    // Оптимизированные частицы (минимальный вес для процессора)
    const particles = [];
    for(let i = 0; i < 25; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 0.8 + 0.3,
            speedX: Math.random() * 0.2 - 0.1,
            speedY: Math.random() * -0.15 - 0.05
        });
    }

    const resizeObserver = new ResizeObserver(() => {
        w = canvas.width = parent.clientWidth;
        h = canvas.height = parent.clientHeight;
    });
    resizeObserver.observe(parent);

    let phase = 0;

    function animate() {
        // МАГИЯ ОПТИМИЗАЦИИ: Режим multiply плавно затухает только нарисованные пиксели,
        // сохраняя при этом холст 100% прозрачным, без образования серого налета.
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'; // Чем меньше число (например 0.75), тем длиннее шлейф
        ctx.fillRect(0, 0, w, h);
        
        // Возвращаем стандартный режим для рисования новых линий
        ctx.globalCompositeOperation = 'source-over';
        phase += config.speed;

        // Плавное сглаживание движения мыши (lerp)
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        // 1. Отрисовка частиц
        ctx.fillStyle = 'rgba(95, 10, 20, 0.25)';
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < 0) p.y = h;
            if (p.x < 0 || p.x > w) p.x = Math.random() * w;
            ctx.fillRect(p.x, p.y, p.r * 1.5, p.r * 1.5);
        });

        // 2. Быстрый рендеринг жгута волны за один проход в памяти
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

                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
