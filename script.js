/** @type {HTMLCanvasElement} */
const canvases = [
  {
    element: document.getElementById("liquid_particles_out"),
    context: null,
    parent: document.getElementById("section01"),
    width: null,
    height: parent.clientHeight,
  },
  {
    element: document.getElementById("liquid_particles_in1"),
    context: null,
    parent: document.getElementById("section02"),
    width: null,
    height: null,
  },
  {
    element: document.getElementById("liquid_particles_in2"),
    context: null,
    parent: document.getElementById("section02"),
    width: null,
    height: null,
  },
];



canvases.forEach((canvas) => {
  if (canvas.element && canvas.parent) {
    // Получаем размеры родительского элемента
    const parentWidth = canvas.parent.clientWidth;
    const parentHeight = canvas.parent.clientHeight;
    
    // Устанавливаем размеры канваса
    canvas.element.width = parentWidth;
    canvas.element.height = parentHeight;
    // console.log(parentWidth);

    // Получаем контекст
    canvas.context = canvas.element.getContext("2d");
  }
});


function colorOptions(ctx, colorFill, colorStroke) {
  ctx.fillStyle = colorFill;
  ctx.strokeStyle = colorStroke;
}
if (canvases[0].context) {
  colorOptions(canvases[0].context, "#6bd9ff", "#6bd9ff");
}
if (canvases[1].context) { 
  colorOptions(canvases[1].context, "#FFFFFF", "#FFFFFF");
 
}
if (canvases[2].context) { 
  colorOptions(canvases[2].context, "#FFFFFF", "#00000");
}


class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = Math.floor(Math.random() * 15 + 10);
    this.buffer = this.radius * 4;
    this.x =  this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =  this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;
    console.log(this.effect);
    
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
 
  }
  update() {
    if (this.effect.mouse.pressed) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }
    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;
    if (this.x < this.buffer) {
      this.x = this.buffer;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.buffer) {
      this.x = this.effect.width - this.buffer;
      this.vx *= -1;
    }
    if (this.y < this.buffer) {
      this.y = this.buffer;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.buffer) {
      this.y = this.effect.height - this.buffer;
      this.vy *= -1;
    }
  }
  reset(context) {
    context.fillStyle = "#6bd9ff";
    context.strokeStyle = "#6bd9ff";
    this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
  }
}

class lineParticle extends Particle {
  constructor(effect) {
    super(effect);  
    this.radius = Math.floor(Math.random() * 25 + 10);
  }
 
  update(){
    if (this.effect.mouse.pressed) {
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = (distance/this.effect.mouse.radius  );
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);      
        this.pushX -= Math.cos(angle) * force;
        this.pushY -= Math.sin(angle) * force;
      }
    }
    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;
    if(this.x < this.buffer){
      this.x = this.buffer;
      this.vx *= -1;
    } else if(this.x > this.effect.width - this.buffer){
      this.x = this.effect.width - this.buffer;
      this.vx *= -1;
    }
    if(this.y < this.buffer){
      this.y = this.buffer;
      this.vy *= -1;
    } else if(this.y > this.effect.height - this.buffer){
      this.y = this.effect.height - this.buffer;
      this.vy *= -1;
    }

   
  }
  reset(context) {
    super.reset(context);
    context.fillStyle = "#FFFFFF";
    context.strokeStyle = "#FFFFFF";
 
  }
}
class Effect {
  constructor(canvas, context, parent) {
    this.canvas = canvas;
    this.context = context;
    this.parent = parent;
    this.width = canvas.width;
    this.height = canvas.height;
       // Определяем количество частиц в зависимости от устройства
       this.numberOfParticles = this.isMobile() ? 100 : 400;
    this.particles = [];
 
    // this.numberOfParticles = 300;
    this.createParticles();
    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 150,
    };
    window.addEventListener("resize", (e) => {
      e.preventDefault();
      this.resize(this.parent.clientWidth, this.parent.clientHeight);
    });

    this.parent.addEventListener("mousemove", (e) => {
      if (this.mouse.pressed) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
      }
    });
    this.parent.addEventListener("mousedown", (e) => {
      this.mouse.pressed = true;
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });
    this.parent.addEventListener("mouseup", (e) => {
      this.mouse.pressed = false;
    });
    this.parent.addEventListener('touchstart', e => {
      e.preventDefault(); // Предотвращаем стандартное поведение
      const rect = canvas.getBoundingClientRect();
      this.mouse.pressed = true;
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
      // console.log('Touch start:', this.mouse.x, this.mouse.y);
    });
    
    this.parent.addEventListener('touchend', e => {
      this.mouse.pressed = false;
    });
    
    this.parent.addEventListener('touchmove', e => {
      e.preventDefault(); // Предотвращаем стандартное поведение
      const rect = canvas.getBoundingClientRect();
      if (this.mouse.pressed) {
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        // console.log('Touch move:', this.mouse.x, this.mouse.y);
      }
    });
  }
    // Проверка на мобильное устройство
    isMobile() {
      return this.parent.clientWidth <= 768; // Ширина экрана меньше или равна 768px
    }
  createParticles() {
    this.particles = []; // Очищаем массив частиц
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
   
    }
  }
  handleParticles(context) {
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  
  }
  connectParticles(context) {
    const maxDistance = 80;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          context.save();
          const opacity = 1 - distance / maxDistance;
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          // context.lineWidth = 0.5;
          context.stroke();
          context.restore();
        }
      }
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
  
    // Пересоздаем частицы
    this.createParticles();
    this.particles.forEach((particle) => {
      particle.reset(this.context);
    });
   
  }
}
class LineEffect extends Effect {
  constructor(canvas,context,parent, canvas2) {
     super(canvas, context, parent);
    this.canvas2 = canvas2;
     // Определяем количество частиц в зависимости от устройства
     this.numberOfParticles = this.isMobile() ? 100 : 300;
  }
  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new lineParticle(this));
    }
  }
  handleParticles(context, context2) {
    this.connectParticles(context2);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
  connectParticles(context){
    const maxDistance = 80;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {        
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx,dy);
        if(distance < maxDistance){
          context.save();
          const opacity = 1 - (distance/maxDistance);
          context.globalAlpha = opacity;
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          // context.lineWidth = 0.5;
          context.stroke();
          context.restore();
        }
      }        
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
   // Обновляем размеры второго холста, если это необходимо
   this.canvas2.width = width;
   this.canvas2.height = height;
    this.particles.forEach((particle) => {
      particle.reset(this.context);
    });
   
  }
}
const effect = new Effect(canvases[0].element, canvases[0].context, canvases[0].parent);
const effect2 = new LineEffect(canvases[1].element, canvases[1].context, canvases[1].parent, canvases[2].element,);

function animate() {
  canvases[0].context.clearRect(0, 0, canvases[0].element.width, canvases[0].element.height);
  canvases[1].context.clearRect(0, 0, canvases[1].element.width, canvases[1].element.height);
  canvases[2].context.clearRect(0, 0, canvases[2].element.width, canvases[2].element.height);
  effect.handleParticles(canvases[0].context);
  effect2.handleParticles(canvases[1].context, canvases[2].context);

  requestAnimationFrame(animate);
}
animate();
