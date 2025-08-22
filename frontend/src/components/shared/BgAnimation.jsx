import React, { useEffect, useRef } from "react";

const BgAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * 6 + 3;
        this.dx = (Math.random() - 0.5) * 0.8;
        this.dy = (Math.random() - 0.5) * 0.8;
        this.color = `hsla(${Math.random() * 360}, 80%, 70%, 0.7)`; // pastel aurora tones
      }

      update() {
        this.x += this.dx;
        this.y += this.dy;

        // bounce edges
        if (this.x < 0 || this.x > w) this.dx *= -1;
        if (this.y < 0 || this.y > h) this.dy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Create particles
    const particles = Array.from({ length: 120 }, () => new Particle());

    // Animation loop
    function animate() {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"; // light mode fade effect
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }
    animate();

    // Resize
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed pointer-events-none -z-10"
      style={{ background: "#fdfdfd" }} // Light background
    />
  );
};

export default BgAnimation;
