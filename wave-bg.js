(function() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    let w = canvas.width = parent.clientWidth;
    let h = canvas.height = parent.clientHeight;

    const config = {
        linesCount: 5,           // 5 линий
        segments: 10,            // Оптимальное количество точек для Безье
        amplitude: 80,           
        speed: 0.006,            // Скорость колыхания (скорректирована под 30 FPS)
        pulseSpeed: 8            // Скорость движения блика (скорректирована под 30 FPS)
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

    const linePulses = [];
    for (let i = 0; i < config.linesCount; i++) {
        linePulses.push({
            x: Math.random() * (w + 200) - 200,
            speedMod: 0.8 + Math.random() * 0.4 
        });
    }

    const resizeObserver = new ResizeObserver(() => {
        w = canvas.width = parent.clientWidth;
        h = canvas.height = parent.clientHeight;
    });
    resizeObserver.observe(parent);

    let phase = 0;
    let evenFrame = false; // Флаг для пропуска кадров

    function animate() {
        requestAnimationFrame(animate);

        // ОПТИМИЗАЦИЯ: Рендерим и считаем математику строго через кадр (Фиксация на 30 FPS)
        // Нагрузка на процессор падает в 2 раза, а для медленной волны плавность сохраняется
        evenFrame = !evenFrame;
        if (!evenFrame) return;

        // Полная очистка холста до абсолютной прозрачности
        ctx.clearRect(0, 0, w, h);
        
        phase += config.speed;

        // Плавная доводка курсора
        mouse.x += (mouse.targetX - mouse.x) * 0.1; // Чуть ускорили доводку для отзывчивости на 30 FPS
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        let neonPulse = 0.85 + Math.sin(phase * 4) * 0.15;

        for (let i = 0; i < config.linesCount; i++) {
            let lineShift = i * 0.7; 
            let points = [];
            let pulseData = linePulses[i];

            pulseData.x += config.pulseSpeed * pulseData.speedMod;
            
            if (pulseData.x > w + 200) {
                pulseData.x = -200 - (Math.random() * 400);
                pulseData.speedMod = 0.8 + Math.random() * 0.4;
            }

            for (let j = 0; j <= config.segments; j++) {
                let x = (w / config.segments) * j;
                let baseY = h * 0.53;
                
                let distToMouseX = x - mouse.x;
                let mouseInfluence = 0;
                if (distToMouseX > -180 && distToMouseX < 180) {
                    mouseInfluence = (180 - Math.abs(distToMouseX)) / 180;
                }
                let mouseOffsetY = (mouse.y - baseY) * 0.2 * mouseInfluence;

                let mainWave = Math.sin(j * 0.4 - phase + lineShift);
                let modWave = Math.cos(j * 0.2 - phase * 0.5 + lineShift * 1.3);
                
                let currentAmp = config.amplitude * (1 + mouseInfluence * 0.1);
                let y = baseY + mouseOffsetY + (mainWave * currentAmp * modWave);

                let edgeFade = Math.sin((j / config.segments) * Math.PI);
                y = baseY + (y - baseY) * edgeFade;

                points.push({ x, y });
            }

            // --- 1. БАЗОВАЯ НЕОНОВАЯ ЛИНИЯ ---
            ctx.lineWidth = 12 * neonPulse;
            ctx.strokeStyle = `rgba(95, 10, 20, ${0.03 * neonPulse})`;
            drawBezierCurve(points);

            ctx.lineWidth = 4 * neonPulse;
            ctx.strokeStyle = `rgba(95, 10, 20, ${0.11 * neonPulse})`;
            drawBezierCurve(points);

            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(110, 10, 22, 0.25)`;
            drawBezierCurve(points);

            // --- 2. РАНДОМНЫЙ БЕГУЩИЙ СВЕТОВОЙ ИМПУЛЬС ---
            let currentPulseX = pulseData.x;

            let pulseGrad = ctx.createLinearGradient(currentPulseX - 150, 0, currentPulseX + 150, 0);
            pulseGrad.addColorStop(0, 'rgba(120, 12, 26, 0.0)');   
            pulseGrad.addColorStop(0.5, 'rgba(215, 20, 40, 0.85)'); 
            pulseGrad.addColorStop(1, 'rgba(120, 12, 26, 0.0)');   

            ctx.lineWidth = 2.2;
            ctx.strokeStyle = pulseGrad;
            drawBezierCurve(points);
        }
    }

    function drawBezierCurve(points) {
        ctx.beginPath();
        ctx.moveTo(points.x, points.y);
        for (let j = 0; j < points.length - 1; j++) {
            let xc = (points[j].x + points[j + 1].x) / 2;
            let yc = (points[j].y + points[j + 1].y) / 2;
            ctx.quadraticCurveTo(points[j].x, points[j].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
    }

    animate();
})();
