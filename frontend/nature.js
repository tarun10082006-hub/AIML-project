(function () {
  // 1. Maintain CSS floating leaves and fireflies for depth
  const container = document.getElementById('particles');
  if (container) {
    const LEAF_SVGS = [
      '<svg viewBox="0 0 40 40" fill="none"><path d="M4 36 Q6 4 36 4 Q30 18 18 26 Q10 31 4 36Z" fill="#10b981"/><path d="M4 36 Q20 20 36 4" stroke="#6ee7b7" stroke-width="1.5" fill="none" opacity=".7"/></svg>',
      '<svg viewBox="0 0 40 40" fill="none"><path d="M4 36 Q6 4 36 4 Q30 18 18 26 Q10 31 4 36Z" fill="#059669"/><path d="M4 36 Q20 20 36 4" stroke="#a7f3d0" stroke-width="1.5" fill="none" opacity=".6"/></svg>',
      '<svg viewBox="0 0 40 40" fill="none"><path d="M4 36 Q6 4 36 4 Q30 18 18 26 Q10 31 4 36Z" fill="#34d399" opacity=".9"/></svg>',
      '<svg viewBox="0 0 40 40" fill="none"><path d="M4 36 Q6 4 36 4 Q30 18 18 26 Q10 31 4 36Z" fill="#065f46"/><path d="M4 36 Q20 20 36 4" stroke="#34d399" stroke-width="1" fill="none" opacity=".5"/></svg>',
      '<svg viewBox="0 0 28 48" fill="none"><ellipse cx="14" cy="24" rx="9" ry="21" fill="#047857" opacity=".85"/><line x1="14" y1="3" x2="14" y2="45" stroke="#6ee7b7" stroke-width="1.2" opacity=".6"/></svg>',
    ];

    // Floating leaves
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('div');
      el.className = 'particle';
      el.innerHTML = LEAF_SVGS[i % LEAF_SVGS.length];
      const size = 12 + Math.random() * 24;
      el.style.cssText = [
        `left:${Math.random() * 100}%`,
        `width:${size}px`,
        `height:${size}px`,
        `animation-duration:${12 + Math.random() * 20}s`,
        `animation-delay:${-(Math.random() * 25)}s`,
        `opacity: ${0.3 + Math.random() * 0.5}`,
        `filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3))`
      ].join(';');
      container.appendChild(el);
    }
  }

  // 2. Interactive Canvas Particle Web (Glowing Pollen/Spores)
  const canvas = document.getElementById('natureCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  let w, h;
  let particles = [];
  
  const mouse = { x: -1000, y: -1000, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    init(); // Reinitialize particles based on density
  }
  window.addEventListener('resize', resize);

  class Pollen {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2.5 + 0.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 15) + 1;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.color = `rgba(${50 + Math.random()*200}, ${200 + Math.random()*55}, ${150 + Math.random()*105}, ${0.5 + Math.random()*0.5})`;
    }
    
    update() {
      // Organic flow mimicking wind
      this.x += this.vx + Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.1;
      this.y += this.vy - Math.cos(Date.now() * 0.001 + this.x * 0.01) * 0.1;
      
      // Wrap around bounds
      if(this.x < -10) this.x = w + 10;
      if(this.x > w + 10) this.x = -10;
      if(this.y < -10) this.y = h + 10;
      if(this.y > h + 10) this.y = -10;

      // Mouse interaction (repel gently)
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      
      let force = (mouse.radius - distance) / mouse.radius;
      let directionX = forceDirectionX * force * this.density;
      let directionY = forceDirectionY * force * this.density;
      
      if (distance < mouse.radius) {
        this.x -= directionX;
        this.y -= directionY;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    // Dynamic density, more particles on larger screens
    let numParticles = Math.floor((w * h) / 9500);
    // limit max particles to prevent lag
    if(numParticles > 200) numParticles = 200; 
    
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Pollen());
    }
  }

  let animationId;
  function animate() {
    ctx.clearRect(0, 0, w, h);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      // Connect nearby particles
      for (let j = i; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        let maxDist = 110;
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.25 - dist/maxDist * 0.25})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Mouse connection
    for (let i = 0; i < particles.length; i++) {
      let dx = mouse.x - particles[i].x;
      let dy = mouse.y - particles[i].y;
      let dist = dx*dx + dy*dy;
      if(dist < mouse.radius * mouse.radius * 0.8) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(167, 243, 208, ${0.15 - dist/(mouse.radius*mouse.radius*0.8) * 0.15})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
      }
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Start up
  resize(); // triggers init()
  animate();
})();
