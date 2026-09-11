<?php
// Часть 1: Начало монолитного PHP-файла (Разметка и стили)
// Здесь можно разместить серверную логику, например, работу с сессиями
session_start();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MARCORP - Главная</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body, html {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #f7f5f5;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Главная изолирующая подложка */
        .preloader-backdrop {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: #f7f5f5 !important; 
            z-index: 9999999 !important; 
            overflow: hidden !important;
            opacity: 1 !important;
            visibility: visible !important;
            /* Плавное растворение запускается ТОЛЬКО в самом конце реверса */
            transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 1.5s !important;
        }

        #vessel-canvas {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1 !important; 
            pointer-events: none !important;
            display: block !important;
        }

        /* HTML Слой для идеально гладкого текста */
        .content-wrapper {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 10 !important; 
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: none !important;
            transition: opacity 0.8s ease; /* Быстрое растворение букв */
        }

        .brand-container {
            text-align: center !important;
            opacity: 0;
            animation: text_fadeIn 2s ease forwards;
            animation-delay: 0.3s; 
        }

        @keyframes text_fadeIn {
            to { opacity: 1; }
        }

        .marcorp-text {
            font-size: clamp(3.2rem, 8.2vw, 7.5rem) !important;
            font-weight: 900 !important;
            color: #1a1a1a !important;
            letter-spacing: 6px !important;
            text-transform: uppercase !important;
            line-height: 1 !important;
        }

        .sub-text {
            margin-top: 18px !important;
            font-size: clamp(0.75rem, 1.2vw, 1.1rem) !important;
            color: #555 !important;
            letter-spacing: 4px !important;
            text-transform: uppercase !important;
            font-weight: 400 !important;
        }

        /* Кнопка с непрозрачной подложкой */
        .start-btn {
            margin-top: 45px !important;
            padding: 14px 44px !important;
            font-size: 1rem !important;
            text-transform: uppercase !important;
            letter-spacing: 3px !important;
            color: #1a1a1a !important;
            background-color: #f7f5f5 !important; 
            border: 1px solid #1a1a1a !important;
            cursor: pointer !important;
            pointer-events: auto !important; 
            z-index: 20 !important;
            opacity: 0;
            transform: translateY(15px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.04) !important;
            transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, color 0.3s ease !important;
        }

        .start-btn.show {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }

        .start-btn:hover {
            background-color: #1a1a1a !important;
            color: #f7f5f5 !important;
        }
        
        /* Классы состояний */
        .fade-out-ui {
            opacity: 0 !important;
        }
        .fade-out-backdrop {
            opacity: 0 !important;
            visibility: hidden !important; 
        }
    </style>
</head>
<body>

    <!-- Задний план сайта -->
    <div style="padding: 100px; text-align: center; color: #333;">
        <h2></h2>
        <!-- ИСПРАВЛЕНО: закрыта кавычка в href и изменен адрес на основной index.php -->
        <p style="margin-top: 20px;"><a href="/index.html"></a></p>
    </div>

    <!-- Прелоадер -->
    <div class="preloader-backdrop" id="preloader-layer">
        <canvas id="vessel-canvas"></canvas>
        <div class="content-wrapper" id="ui-wrapper">
            <div class="brand-container" id="brand-block">
                <div class="marcorp-text">MARCORP</div>
                <div class="sub-text">Современные решения в медицине</div>
                <button class="start-btn" id="start-button">Начать</button>
            </div>
        </div>
    </div>
    <script>
    (function() {
        const canvas = document.getElementById('vessel-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let textPoints = [];
        let vessels = [];
        let vesselsThroughText = 0;
        const maxVesselsThrough = 3;

        let buttonTimerStarted = false;
        let isReversing = false;

        function calculateTextZone() {
            textPoints = [];
            const brandBlock = document.getElementById('brand-block');
            if (!brandBlock) return;
            
            let rect = brandBlock.getBoundingClientRect();

            const virtualCanvas = document.createElement('canvas');
            const vCtx = virtualCanvas.getContext('2d');
            virtualCanvas.width = width;
            virtualCanvas.height = height;

            const mainTextEl = document.querySelector('.marcorp-text');
            let fontWeight = "900";
            let fontSize = "110px";
            
            if (mainTextEl) {
                const computedStyle = window.getComputedStyle(mainTextEl);
                fontWeight = computedStyle.fontWeight || "900";
                fontSize = computedStyle.fontSize || "110px";
            }
            
            vCtx.font = `${fontWeight} ${fontSize} 'Segoe UI', Tahoma, sans-serif`;
            vCtx.textBaseline = 'middle';
            vCtx.textAlign = 'center';
            vCtx.fillStyle = 'black';
            
            let centerX = width / 2;
            let centerY = height / 2;
            
            if (rect && rect.width > 0) {
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }
            
            vCtx.fillText("MARCORP", centerX, centerY);

            const imgData = vCtx.getImageData(0, 0, width, height).data;
            const step = 8; 
            
            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const alphaIndex = (y * width + x) * 4 + 3;
                    if (imgData[alphaIndex] > 50) { 
                        textPoints.push({ x: x, y: y });
                    }
                }
            }
        }

        class Vessel {
            constructor(x, y, angle, speed, thickness, generation) {
                this.startX = x;
                this.startY = y;
                this.x = x;
                this.y = y;
                this.angle = angle;
                this.speed = speed;
                this.thickness = thickness;
                this.generation = generation;
                this.life = 0;
                this.maxLife = Math.random() * 200 + 100; 
                this.active = true;
                this.allowedThrough = false;
                this.personalPadding = Math.random() * 160; 
                this.path = [{x: x, y: y}];
            }
            update() {
                if (!this.active) return;

                const prevX = this.x;
                const prevY = this.y;

                if (!this.allowedThrough) {
                    const currentX = this.x;
                    const currentY = this.y;

                    for (let i = 0; i < textPoints.length; i++) {
                        const pt = textPoints[i];
                        const dx = pt.x - currentX;
                        const dy = pt.y - currentY;
                        
                        if (dx * dx + dy * dy < this.personalPadding * this.personalPadding) {
                            if (vesselsThroughText < maxVesselsThrough && this.generation === 0) {
                                vesselsThroughText++;
                                this.allowedThrough = true;
                                break; 
                            } else {
                                this.active = false; 
                                return;
                            }
                        }
                    }
                }

                this.angle += (Math.random() - 0.5) * 0.35;
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                this.path.push({x: this.x, y: this.y});
                this.life++;

                let alpha = Math.max(0.05, 0.85 - this.generation * 0.12);

                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `rgba(${170 - this.generation * 12}, ${15 + this.generation * 4}, ${25 + this.generation * 2}, ${alpha})`;
                ctx.lineWidth = this.thickness;
                ctx.lineCap = 'round';
                ctx.stroke();

                if (this.active && this.thickness > 0.4) {
                    let branchChance = 0.035;
                    if (this.x > width * 0.4) branchChance = 0.015;

                    if (Math.random() < branchChance && this.generation < 6) { 
                        const branchAngle = this.angle + (Math.random() - 0.5) * 0.8;
                        const branchSpeed = this.speed * (0.8 + Math.random() * 0.3); 
                        const branchThickness = this.thickness * 0.65; 
                        
                        const newBranch = new Vessel(this.x, this.y, branchAngle, branchSpeed, branchThickness, this.generation + 1);
                        newBranch.allowedThrough = this.allowedThrough; 
                        newBranch.personalPadding = this.personalPadding; 
                        
                        vessels.push(newBranch);
                        this.thickness *= 0.75;
                    }
                }

                if (this.life > this.maxLife || this.x > width || this.y < 0 || this.y > height) {
                    this.active = false;
                }
            }
        }
        function init() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, width, height);
            
            vesselsThroughText = 0; 
            buttonTimerStarted = false;
            isReversing = false;
            
            const startBtn = document.getElementById('start-button');
            const uiWrapper = document.getElementById('ui-wrapper');
            const preloaderLayer = document.getElementById('preloader-layer');
            
            if (startBtn) startBtn.classList.remove('show');
            if (uiWrapper) uiWrapper.classList.remove('fade-out-ui');
            if (preloaderLayer) preloaderLayer.classList.remove('fade-out-backdrop');

            calculateTextZone();

            vessels = [];
            const mainVesselsCount = Math.floor(height / 110); 
            for (let i = 0; i < mainVesselsCount; i++) {
                const startX = -10;
                const startY = (height / mainVesselsCount) * i + (Math.random() - 0.5) * 50;
                const startAngle = (Math.random() - 0.5) * 0.1; 
                const speed = Math.random() * 2.5 + 3.0; 
                const thickness = Math.random() * 4 + 7; 

                vessels.push(new Vessel(startX, startY, startAngle, speed, thickness, 0));
            }
            
            setTimeout(() => {
                if (!buttonTimerStarted) {
                    buttonTimerStarted = true;
                    if (startBtn) startBtn.classList.add('show');
                }
            }, 500);
        }

        function redrawCanvas() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < vessels.length; i++) {
                const v = vessels[i];
                if (v.path.length < 2) continue; 

                let alpha = Math.max(0.05, 0.85 - v.generation * 0.12);
                ctx.lineWidth = v.thickness;
                ctx.lineCap = 'round';
                ctx.strokeStyle = `rgba(${170 - v.generation * 12}, ${15 + v.generation * 4}, ${25 + v.generation * 2}, ${alpha})`;

                ctx.beginPath();
                ctx.moveTo(v.path[0].x, v.path[0].y); 
                for (let j = 1; j < v.path.length; j++) {
                    ctx.lineTo(v.path[j].x, v.path[j].y);
                }
                ctx.stroke();
            }
        }

        function animate() {
            if (!isReversing) {
                let anyActive = false;
                for (let i = vessels.length - 1; i >= 0; i--) {
                    if (vessels[i].active) {
                        vessels[i].update();
                        anyActive = true;
                    }
                }

                if (!anyActive && !buttonTimerStarted) {
                    buttonTimerStarted = true;
                    setTimeout(() => {
                        const btn = document.getElementById('start-button');
                        if (btn) btn.classList.add('show');
                    }, 500); 
                }
            } else {
                let hasHistory = false;
                const eraseSpeed = 4; 

                for (let i = 0; i < vessels.length; i++) {
                    if (vessels[i].path.length > 1) {
                        vessels[i].path.splice(-eraseSpeed); 
                        if (vessels[i].path.length > 1) {
                            hasHistory = true;
                        }
                    }
                }

                if (hasHistory) {
                    redrawCanvas();
                } else {
                    isReversing = false;
                    ctx.clearRect(0, 0, width, height);
                    onPreloaderComplete(); 
                }
            }

            requestAnimationFrame(animate);
        }

        function onPreloaderComplete() {
            console.log("Сосуды уползли. Запускаем плавное исчезновение фона...");
            const preloader = document.getElementById('preloader-layer');
            if (preloader) {
                preloader.classList.add('fade-out-backdrop');
                
                setTimeout(() => {
                    preloader.remove();
                    
                    console.log("Основной текст виден. Редирект...");
                    window.location.href = '/index.html'; 

                }, 500);
            }
        }

        function setupEvents() {
            const startBtn = document.getElementById('start-button');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    const uiWrapper = document.getElementById('ui-wrapper');
                    
                    if (uiWrapper) uiWrapper.classList.add('fade-out-ui');
                    for (let i = 0; i < vessels.length; i++) {
                        vessels[i].active = false;
                    }
                    isReversing = true;
                });
            }
            init();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEvents);
        } else {
            setupEvents();
        }
        
        animate();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        });
    })();
    </script>
</body>
</html>
