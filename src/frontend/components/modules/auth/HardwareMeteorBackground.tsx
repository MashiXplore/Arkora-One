// src/frontend/components/modules/auth/HardwareMeteorBackground.tsx
// Fondo animado de "Lluvia de Meteoros de Hardware":
// Caída diagonal fluida de elementos de TI (tuercas/engranajes, mouse, teclado, chips, RAM)
// con estelas luminosas de neón y efecto de profundidad cibernética.
// Skills: modern-web-guidance, react-modernization

'use client';

import React, { useEffect, useRef } from 'react';

type HardwareType = 'gear' | 'mouse' | 'keyboard' | 'chip' | 'ram';

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  type: HardwareType;
  opacity: number;
  hue: number; // 190-230 (Cyan/Blue range)
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  phase: number;
}

export function HardwareMeteorBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Ajustar dimensiones en resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Pausar animación cuando la pestaña está en segundo plano (modern-web-guidance: efficient-background-processing)
    const handleVisibilityChange = () => {
      isRunning = document.visibilityState === 'visible';
      if (isRunning) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Tipos de hardware disponibles
    const HARDWARE_TYPES: HardwareType[] = ['gear', 'mouse', 'keyboard', 'chip', 'ram'];

    // Configuración de meteoros
    const METEOR_COUNT = Math.min(22, Math.max(12, Math.floor(width / 80)));
    const meteors: Meteor[] = [];

    // Ángulo de caída: diagonal ~35 grados (de arriba-derecha a abajo-izquierda)
    const ANGLE = (145 * Math.PI) / 180;
    const cosAngle = Math.cos(ANGLE);
    const sinAngle = Math.sin(ANGLE);

    function createMeteor(randomY = true): Meteor {
      const startX = Math.random() * (width + 500) - 100;
      const startY = randomY ? Math.random() * height : -60 - Math.random() * 200;
      return {
        x: startX,
        y: startY,
        length: 50 + Math.random() * 90,
        speed: 1.8 + Math.random() * 2.8,
        size: 0.6 + Math.random() * 0.7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        type: HARDWARE_TYPES[Math.floor(Math.random() * HARDWARE_TYPES.length)],
        opacity: 0.25 + Math.random() * 0.55,
        hue: 195 + Math.random() * 35, // Cyan to Royal Blue
      };
    }

    // Inicializar meteoros
    for (let i = 0; i < METEOR_COUNT; i++) {
      meteors.push(createMeteor(true));
    }

    // Estrellas / polvo cibernético de fondo
    const STAR_COUNT = Math.min(60, Math.floor(width / 25));
    let stars: Star[] = [];
    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 0.8 + Math.random() * 1.5,
          opacity: 0.15 + Math.random() * 0.5,
          twinkleSpeed: 0.01 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    initStars();

    // ─────────────────────────────────────────────────────────────
    // DIBUJO DE ELEMENTOS DE HARDWARE
    // ─────────────────────────────────────────────────────────────

    // 1. Tuerca / Engranaje (Gear)
    function drawGear(c: CanvasRenderingContext2D, size: number) {
      const radius = 10 * size;
      const innerRadius = 4 * size;
      const teeth = 6;
      c.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? radius : radius * 0.72;
        const gx = Math.cos(angle) * r;
        const gy = Math.sin(angle) * r;
        if (i === 0) c.moveTo(gx, gy);
        else c.lineTo(gx, gy);
      }
      c.closePath();
      c.fill();
      c.stroke();

      // Agujero interior
      c.beginPath();
      c.arc(0, 0, innerRadius, 0, Math.PI * 2);
      c.fillStyle = 'rgba(10, 15, 30, 0.9)';
      c.fill();
      c.stroke();
    }

    // 2. Ratón Óptico (Mouse)
    function drawMouse(c: CanvasRenderingContext2D, size: number) {
      const w = 12 * size;
      const h = 18 * size;
      const r = 5 * size;
      c.beginPath();
      c.roundRect(-w / 2, -h / 2, w, h, [r, r, r * 1.2, r * 1.2]);
      c.fill();
      c.stroke();

      // División de botones y ruedita
      c.beginPath();
      c.moveTo(0, -h / 2);
      c.lineTo(0, -h / 2 + 7 * size);
      c.moveTo(-w / 2 + 1, -h / 2 + 7 * size);
      c.lineTo(w / 2 - 1, -h / 2 + 7 * size);
      c.stroke();

      // Scroll wheel
      c.fillStyle = '#38bdf8';
      c.fillRect(-1.5 * size, -h / 2 + 2 * size, 3 * size, 4 * size);

      // Cable sutil
      c.beginPath();
      c.moveTo(0, -h / 2);
      c.bezierCurveTo(
        -3 * size,
        -h / 2 - 5 * size,
        3 * size,
        -h / 2 - 8 * size,
        0,
        -h / 2 - 12 * size
      );
      c.stroke();
    }

    // 3. Tecla / Teclado mecánico (Keycap)
    function drawKeycap(c: CanvasRenderingContext2D, size: number) {
      const s = 16 * size;
      const bevel = 3 * size;
      // Base externa
      c.beginPath();
      c.roundRect(-s / 2, -s / 2, s, s, 3 * size);
      c.fill();
      c.stroke();

      // Cara superior biselada
      c.beginPath();
      c.roundRect(
        -s / 2 + bevel / 2,
        -s / 2 + bevel / 2,
        s - bevel,
        s - bevel,
        2 * size
      );
      c.fillStyle = 'rgba(30, 58, 138, 0.5)';
      c.fill();
      c.stroke();

      // Letra / símbolo de TI ("Ctrl" o icono)
      c.fillStyle = '#60a5fa';
      c.font = `bold ${Math.round(7 * size)}px monospace`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('⌘', 0, 0);
    }

    // 4. Procesador CPU / Chip
    function drawChip(c: CanvasRenderingContext2D, size: number) {
      const s = 17 * size;
      // Cuerpo del chip
      c.beginPath();
      c.roundRect(-s / 2, -s / 2, s, s, 2 * size);
      c.fill();
      c.stroke();

      // Heatspreader central
      c.fillStyle = 'rgba(56, 189, 248, 0.25)';
      c.fillRect(-s / 4, -s / 4, s / 2, s / 2);
      c.strokeRect(-s / 4, -s / 4, s / 2, s / 2);

      // Pines conectores en los 4 bordes
      const pinLength = 3 * size;
      const pinCount = 3;
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 1 * size;
      for (let i = -pinCount; i <= pinCount; i += 2) {
        const offset = (i * s) / (pinCount * 2.5);
        // Top & Bottom pins
        c.beginPath();
        c.moveTo(offset, -s / 2);
        c.lineTo(offset, -s / 2 - pinLength);
        c.moveTo(offset, s / 2);
        c.lineTo(offset, s / 2 + pinLength);
        // Left & Right pins
        c.moveTo(-s / 2, offset);
        c.lineTo(-s / 2 - pinLength, offset);
        c.moveTo(s / 2, offset);
        c.lineTo(s / 2 + pinLength, offset);
        c.stroke();
      }
    }

    // 5. Módulo de Memoria RAM
    function drawRam(c: CanvasRenderingContext2D, size: number) {
      const w = 24 * size;
      const h = 9 * size;
      // Placa PCB
      c.beginPath();
      c.roundRect(-w / 2, -h / 2, w, h, 1.5 * size);
      c.fill();
      c.stroke();

      // Chips de memoria negros
      c.fillStyle = 'rgba(15, 23, 42, 0.85)';
      const chipW = 4 * size;
      const chipH = 5 * size;
      for (let x = -w / 2 + 3 * size; x <= w / 2 - 6 * size; x += chipW + 2 * size) {
        c.fillRect(x, -h / 2 + 1.5 * size, chipW, chipH);
      }

      // Contactos dorados inferiores
      c.fillStyle = '#fbbf24';
      c.fillRect(-w / 2 + 2 * size, h / 2 - 1.5 * size, w - 4 * size, 1.5 * size);
    }

    // ─────────────────────────────────────────────────────────────
    // BUCLE PRINCIPAL DE RENDER
    // ─────────────────────────────────────────────────────────────
    let lastTime = performance.now();

    function render(currentTime: number) {
      if (!isRunning) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Dibujar estrellas/polvo cibernético sutil
      for (const star of stars) {
        star.phase += star.twinkleSpeed;
        const currentOpacity = star.opacity * (0.6 + 0.4 * Math.sin(star.phase));
        ctx.fillStyle = `rgba(147, 197, 253, ${currentOpacity.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar cada meteoro de hardware
      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];

        // Mover según ángulo y velocidad
        m.x += cosAngle * m.speed * 60 * delta;
        m.y += sinAngle * m.speed * 60 * delta;
        m.rotation += m.rotSpeed;

        // Estela del meteoro (cola luminosa de neón)
        const tailX = m.x - cosAngle * m.length;
        const tailY = m.y - sinAngle * m.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        gradient.addColorStop(0, `hsla(${m.hue}, 90%, 65%, 0)`);
        gradient.addColorStop(0.7, `hsla(${m.hue}, 90%, 65%, ${(m.opacity * 0.35).toFixed(2)})`);
        gradient.addColorStop(1, `hsla(${m.hue}, 100%, 75%, ${(m.opacity * 0.95).toFixed(2)})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 * m.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Resplandor en la cabeza del meteoro
        const glow = ctx.createRadialGradient(m.x, m.y, 1, m.x, m.y, 14 * m.size);
        glow.addColorStop(0, `hsla(${m.hue}, 100%, 75%, ${(m.opacity * 0.7).toFixed(2)})`);
        glow.addColorStop(1, `hsla(${m.hue}, 100%, 75%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 14 * m.size, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar el icono de hardware rotando en la cabeza
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rotation);

        ctx.fillStyle = `hsla(${m.hue}, 80%, 25%, ${m.opacity.toFixed(2)})`;
        ctx.strokeStyle = `hsla(${m.hue}, 100%, 70%, ${(m.opacity * 0.9).toFixed(2)})`;
        ctx.lineWidth = 1.2 * m.size;

        switch (m.type) {
          case 'gear':
            drawGear(ctx, m.size);
            break;
          case 'mouse':
            drawMouse(ctx, m.size);
            break;
          case 'keyboard':
            drawKeycap(ctx, m.size);
            break;
          case 'chip':
            drawChip(ctx, m.size);
            break;
          case 'ram':
            drawRam(ctx, m.size);
            break;
        }

        ctx.restore();

        // Reubicar cuando sale de la pantalla
        if (m.x < -150 || m.y > height + 150) {
          meteors[i] = createMeteor(false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0"
      aria-hidden="true"
    />
  );
}
