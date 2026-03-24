"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animId: number;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      const count = Math.floor(
        (canvas!.width * canvas!.height) / 25000
      );
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(144, 224, 239, ${p.opacity})`;
        ctx!.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < -p.size) p.x = canvas!.width + p.size;
        if (p.x > canvas!.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = canvas!.height + p.size;
        if (p.y > canvas!.height + p.size) p.y = -p.size;
      });
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    />
  );
}
