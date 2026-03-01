import { PhysicsEngine } from './physics.js';

const canvas = document.getElementById('speedometerCanvas');
const ctx = canvas.getContext('2d');

const physics = new PhysicsEngine();
let lastTime = Date.now();
let animationId;

// Elements
const speedValue = document.getElementById('speedValue');
const accelValue = document.getElementById('accelValue');
const engineStatus = document.getElementById('engineStatus');
const accelerateBtn = document.getElementById('accelerateBtn');
const brakeBtn = document.getElementById('brakeBtn');
const resetBtn = document.getElementById('resetBtn');

// Button event listeners
accelerateBtn.addEventListener('mousedown', () =>
  physics.setAccelerating(true),
);
accelerateBtn.addEventListener('mouseup', () => physics.setAccelerating(false));
accelerateBtn.addEventListener('mouseleave', () =>
  physics.setAccelerating(false),
);
accelerateBtn.addEventListener('touchstart', () =>
  physics.setAccelerating(true),
);
accelerateBtn.addEventListener('touchend', () =>
  physics.setAccelerating(false),
);

brakeBtn.addEventListener('mousedown', () => physics.setBraking(true));
brakeBtn.addEventListener('mouseup', () => physics.setBraking(false));
brakeBtn.addEventListener('mouseleave', () => physics.setBraking(false));
brakeBtn.addEventListener('touchstart', () => physics.setBraking(true));
brakeBtn.addEventListener('touchend', () => physics.setBraking(false));

resetBtn.addEventListener('click', () => {
  physics.reset();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    physics.setAccelerating(true);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    physics.setAccelerating(false);
  }
});

function drawSpeedometer() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 20;
  const radius = 120;

  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar fundo do velocímetro
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Desenhar círculo interno
  ctx.fillStyle = '#f0f0f0';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Desenhar escala e números
  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 200; i += 20) {
    const angle = (i / 200) * Math.PI - Math.PI / 2;
    const x1 = centerX + Math.cos(angle) * (radius - 10);
    const y1 = centerY + Math.sin(angle) * (radius - 10);
    const x2 = centerX + Math.cos(angle) * (radius - 25);
    const y2 = centerY + Math.sin(angle) * (radius - 25);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Números
    const textX = centerX + Math.cos(angle) * (radius - 45);
    const textY = centerY + Math.sin(angle) * (radius - 45);
    ctx.fillText(i, textX, textY);
  }

  // Desenhar divisões pequenas
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 200; i += 10) {
    if (i % 20 !== 0) {
      const angle = (i / 200) * Math.PI - Math.PI / 2;
      const x1 = centerX + Math.cos(angle) * (radius - 15);
      const y1 = centerY + Math.sin(angle) * (radius - 15);
      const x2 = centerX + Math.cos(angle) * (radius - 22);
      const y2 = centerY + Math.sin(angle) * (radius - 22);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // Desenhar agulha
  const velocity = physics.getVelocity();
  const needleAngle = (velocity / 200) * Math.PI - Math.PI / 2;
  const needleLength = radius - 30;

  const needleX = centerX + Math.cos(needleAngle) * needleLength;
  const needleY = centerY + Math.sin(needleAngle) * needleLength;

  // Sombra da agulha
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // Desenhar centro da agulha (círculo)
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#667eea';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Desenhar zona vermelha (limite de velocidade)
  ctx.fillStyle = 'rgba(245, 87, 108, 0.1)';
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    radius - 5,
    (180 / 200) * Math.PI - Math.PI / 2,
    Math.PI + Math.PI / 2,
  );
  ctx.lineTo(centerX, centerY);
  ctx.fill();

  // Texto "km/h"
  ctx.fillStyle = '#666';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('km/h', centerX, centerY + radius - 30);
}

function updateDisplay() {
  const velocity = physics.getVelocity();
  const acceleration = physics.getAcceleration();

  speedValue.textContent = velocity.toFixed(1);
  accelValue.textContent = acceleration.toFixed(1);

  if (velocity > 0) {
    engineStatus.textContent = 'Ligado';
    engineStatus.style.color = '#27ae60';
  } else {
    engineStatus.textContent = 'Desligado';
    engineStatus.style.color = '#e74c3c';
  }
}

function animate() {
  const currentTime = Date.now();
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  physics.update(deltaTime);
  drawSpeedometer();
  updateDisplay();

  animationId = requestAnimationFrame(animate);
}

// Iniciar animação
animate();
