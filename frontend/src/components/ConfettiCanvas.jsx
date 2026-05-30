import React, { useEffect, useRef } from 'react';

const ConfettiCanvas = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#ff6b4a', // Accent Orange
      '#4f46e5', // Accent Blue/Indigo
      '#4ade80', // Accent Green
      '#00f2ff', // Accent Cyan
      '#fbbf24', // Luxury Gold
      '#ec4899', // Premium Pink/Magenta
    ];

    const particles = [];

    class Particle {
      constructor(x, y, isBurst = false) {
        this.x = x ?? Math.random() * width;
        this.y = y ?? (Math.random() * -height - 20); // Start offscreen
        this.size = Math.random() * 8 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.shape = Math.floor(Math.random() * 3); // 0: Rect, 1: Circle, 2: Triangle

        if (isBurst) {
          // Burst speeds (diagonal explosion)
          const speed = Math.random() * 12 + 6;
          const angle = x < width / 2 
            ? (Math.random() * -45 - 15) * Math.PI / 180 // Shoot up and right
            : (Math.random() * -45 - 120) * Math.PI / 180; // Shoot up and left
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
        } else {
          // Normal rain speeds
          this.vx = Math.random() * 4 - 2;
          this.vy = Math.random() * 5 + 4;
        }

        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.scaleY = Math.random() * 2 - 1;
        this.scaleYSpeed = Math.random() * 0.05 + 0.02;

        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.03 + 0.01;
        this.gravity = 0.25;
        this.drag = 0.985;
        this.isBurst = isBurst;
      }

      update() {
        if (this.isBurst) {
          this.vy += this.gravity;
          this.vx *= this.drag;
          this.vy *= this.drag;
          this.x += this.vx;
          this.y += this.vy;
        } else {
          this.y += this.vy;
          this.x += this.vx + Math.sin(this.swayAngle) * 0.5;
          this.swayAngle += this.swaySpeed;
        }

        this.rotation += this.rotationSpeed;
        this.scaleY += this.scaleYSpeed;
        if (this.scaleY > 1) this.scaleY = -1;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.scale(1, this.scaleY);
        ctx.fillStyle = this.color;

        ctx.beginPath();
        if (this.shape === 0) {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.shape === 1) {
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Left corner burst
    for (let i = 0; i < 45; i++) {
      particles.push(new Particle(20, height - 20, true));
    }
    // Right corner burst
    for (let i = 0; i < 45; i++) {
      particles.push(new Particle(width - 20, height - 20, true));
    }
    // Central top rain
    for (let i = 0; i < 70; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let activeParticles = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();

        // Keep active if not completely off bottom/sides
        if (p.y < height + 50 && p.x > -50 && p.x < width + 50) {
          activeParticles = true;
        }
      }

      if (activeParticles) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10000,
      }}
    />
  );
};

export default ConfettiCanvas;
