(function() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    let w = canvas.width = parent.clientWidth;
    let h = canvas.height = parent.clientHeight;

    const config = {
        linesCount: 30,          // Плотность жгута
        segments: 60,            // Оптимальное количество точек для 60 FPS
        amplitude: 100,          // Высота изгиба
        speed: 0.006,            // Скорость движения
        waveColor: 'rgba(95, 10, 20, 0.18)', // Насыщенный бордовый
        trailLength: 4           // Количество кадров в шлейфе
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

    // Буфер в памяти для хранения картинок прошлых кадров (для создания шлейфа)
    const trailBuffer = [];

    // Легкие частицы пыли
    const particles = [];
    for(let i = 0; i < 20; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 0.8 + 0.3,
            speedX: Math.random() * 0.16 - 0.08,
            speedY: Math.random() * -0.12 - 0.04
        });
    }

    const resizeObserver = new ResizeObserver(() => {
        w = canvas.width = parent.clientWidth;
        h = canvas.height = parent.clientHeight;
        trailBuffer.length = 0; // Сбрасываем буфер картинок при ресайзе
    });
    resizeObserver.observe(parent);

    let phase = 0;

    // Вспомогательная функция отрисовки текущего кадра волны
    function drawCurrentFrame() {
        // 1. Отрисовка частиц
        ctx.fillStyle = 'rgba(95, 10, 20, 0.25)';
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < 0) p.y = h;
            if (p.x < 0 || p.x > w) p.x = Math.random() * w;
            ctx.fillRect(p.x, p.y, p.r * 1.5, p.r * 1.5);
        });

        // 2. Отрисовка нитей
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
    }

    function animate() {
        // Шаг 1. Полностью очищаем видимый холст до прозрачности
        ctx.clearRect(0, 0, w, h);
        
        phase += config.speed;
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        // Шаг 2. Создаем временный холст в памяти для записи текущего кадра
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');

        // Перенаправляем контекст рисования на временный холст
        const originalCtx = ctx;
        window.ctx = tempCtx; 
        // Рисуем текущую геометрию волны во временную память
        drawCurrentFrame();
        // Возвращаем основной контекст
        window.ctx = originalCtx;

        // Сохраняем полученный кадр в буфер
        trailBuffer.push(tempCanvas);
        if (trailBuffer.length > config.trailLength) {
            trailBuffer.shift(); // Удаляем самый старый кадр
        }

        // Шаг 3. Выводим сохраненные кадры из памяти на экран с разной прозрачностью
        trailBuffer.forEach((cachedFrame, index) => {
            // Чем старее кадр, тем меньше его прозрачность (эффект шлейфа)
            ctx.globalAlpha = (index + 1) / trailBuffer.length;
            ctx.drawImage(cachedFrame, 0, 0);
        });

        // Сбрасываем альфу в дефолт
        ctx.globalAlpha = 1.0;

        requestAnimationFrame(animate);
    }

    animate();
})();
