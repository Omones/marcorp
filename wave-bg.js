(function() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    let w = canvas.width = parent.clientWidth;
    let h = canvas.height = parent.clientHeight;

    const config = {
        linesCount: 24,          // Оптимальное число нитей (снижает нагрузку на CPU)
        segments: 60,            // Детализация изгибов
        amplitude: 100,          // Высота изгиба волны
        speed: 0.006,            // Скорость движения
        waveColor: 'rgba(95, 10, 20, 0.16)', // Бордовый цвет
        trailLength: 4           // Количество слоев шлейфа в буфере
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

    // ПЕРЕИСПОЛЬЗУЕМЫЙ БУФЕР: Создаем холсты один раз при старте и больше не выделяем под них память
    const trailBuffer = [];
    for (let i = 0; i < config.trailLength; i++) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        trailBuffer.push({
            canvas: tempCanvas,
            ctx: tempCanvas.getContext('2d')
        });
    }
    let currentBufferIndex = 0;

    // Частицы пыли
    const particles = [];
    for(let i = 0; i < 18; i++) {
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
        // Подгоняем размеры постоянного буфера под новое окно
        trailBuffer.forEach(item => {
            item.canvas.width = w;
            item.canvas.height = h;
        });
    });
    resizeObserver.observe(parent);

    let phase = 0;

    // Отрисовка текущей геометрии в конкретный контекст
    function drawCurrentFrame(targetCtx) {
        // 1. Отрисовка частиц
        targetCtx.fillStyle = 'rgba(95, 10, 20, 0.25)';
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < 0) p.y = h;
            if (p.x < 0 || p.x > w) p.x = Math.random() * w;
            targetCtx.fillRect(p.x, p.y, p.r * 1.5, p.r * 1.5);
        });

        // 2. Отрисовка геометрии жгута волны
        targetCtx.lineWidth = 1.2; // Немного утолщили нити, компенсируя их меньшее количество
        targetCtx.strokeStyle = config.waveColor;

        for (let i = 0; i < config.linesCount; i++) {
            targetCtx.beginPath();
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

                if (j === 0) targetCtx.moveTo(x, y);
                else targetCtx.lineTo(x, y);
            }
            targetCtx.stroke();
        }
    }

    function animate() {
        // Очищаем основной холст до абсолютной прозрачности
        ctx.clearRect(0, 0, w, h);
        
        phase += config.speed;
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        // Берем следующий по кругу холст из постоянного буфера памяти и очищаем его
        const activeBuffer = trailBuffer[currentBufferIndex];
        activeBuffer.ctx.clearRect(0, 0, w, h);

        // Рисуем новый кадр в этот буфер
        drawCurrentFrame(activeBuffer.ctx);

        // Выводим все слои из буфера на экран, начиная со старых к новым
        for (let i = 0; i < config.trailLength; i++) {
            // Рассчитываем индекс кадра так, чтобы идти от старых к свежим
            let index = (currentBufferIndex + 1 + i) % config.trailLength;
            
            // Настраиваем прозрачность слоя (чем старее кадр, тем он бледнее)
            ctx.globalAlpha = (i + 1) / config.trailLength;
            ctx.drawImage(trailBuffer[index].canvas, 0, 0);
        }

        // Возвращаем дефолтную прозрачность основного холста
        ctx.globalAlpha = 1.0;

        // Сдвигаем индекс циклического буфера для следующего кадра
        currentBufferIndex = (currentBufferIndex + 1) % config.trailLength;

        requestAnimationFrame(animate);
    }

    animate();
})();
