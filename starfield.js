const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let stars = [];
const STAR_COUNT = 250;
const STAR_COLOR = '#fff';
const STAR_MIN_RADIUS = 0.3;
const STAR_MAX_RADIUS = 1.2;
const MOVING_STAR_COUNT = 15;

// Shooting star state
let shootingStar = null;
let nextShootingStarTime = Date.now() + Math.random() * 4000 + 2000; // 2-6s

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createStar(moving = false) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: randomBetween(STAR_MIN_RADIUS, STAR_MAX_RADIUS),
    baseAlpha: randomBetween(0.5, 1),
    alpha: 1,
    twinkleSpeed: randomBetween(0.005, 0.02),
    twinkleDir: Math.random() > 0.5 ? 1 : -1,
    moving,
    dx: moving ? randomBetween(-0.07, 0.07) : 0,
    dy: moving ? randomBetween(-0.07, 0.07) : 0
  };
}

function createShootingStar() {
  // Start from random top or left edge, move diagonally down-right
  const fromTop = Math.random() > 0.5;
  let x, y, dx, dy;
  if (fromTop) {
    x = randomBetween(0, canvas.width * 0.7);
    y = -20;
    dx = randomBetween(6, 10);
    dy = randomBetween(3, 6);
  } else {
    x = -20;
    y = randomBetween(0, canvas.height * 0.7);
    dx = randomBetween(6, 10);
    dy = randomBetween(3, 6);
  }
  return {
    x,
    y,
    dx,
    dy,
    len: randomBetween(80, 140),
    life: 0,
    maxLife: randomBetween(40, 60),
    alpha: 1
  };
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar(i < MOVING_STAR_COUNT));
  }
}

function drawGalaxyGradient() {
  // Radial gradient for galaxy effect
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.max(canvas.width, canvas.height) * 0.7;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#232a5d'); // light blue center
  grad.addColorStop(0.3, '#181d3a'); // deep blue
  grad.addColorStop(0.7, '#0a1333'); // dark blue
  grad.addColorStop(1, '#070a1a'); // almost black
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  for (const star of stars) {
    ctx.save();
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
    ctx.fillStyle = STAR_COLOR;
    ctx.shadowColor = STAR_COLOR;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

function drawShootingStar() {
  if (!shootingStar) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, shootingStar.alpha);
  // Draw the head (bright point)
  ctx.beginPath();
  ctx.arc(shootingStar.x, shootingStar.y, 2.5, 0, 2 * Math.PI);
  ctx.fillStyle = '#fffbe7';
  ctx.shadowColor = '#fffbe7';
  ctx.shadowBlur = 18;
  ctx.fill();
  // Draw the tail
  const tailX = shootingStar.x - shootingStar.dx * 8;
  const tailY = shootingStar.y - shootingStar.dy * 8;
  const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
  grad.addColorStop(0, 'rgba(255,255,230,0.8)');
  grad.addColorStop(1, 'rgba(255,255,230,0)');
  ctx.beginPath();
  ctx.moveTo(shootingStar.x, shootingStar.y);
  ctx.lineTo(tailX, tailY);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = grad;
  ctx.stroke();
  ctx.restore();
}

function updateStars() {
  for (const star of stars) {
    // Twinkle
    star.alpha += star.twinkleDir * star.twinkleSpeed;
    if (star.alpha > 1) {
      star.alpha = 1;
      star.twinkleDir = -1;
    } else if (star.alpha < star.baseAlpha) {
      star.alpha = star.baseAlpha;
      star.twinkleDir = 1;
    }
    // Move
    if (star.moving) {
      star.x += star.dx;
      star.y += star.dy;
      // Wrap around
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
      if (star.y < 0) star.y = canvas.height;
      if (star.y > canvas.height) star.y = 0;
    }
  }
}

function updateShootingStar() {
  if (!shootingStar) return;
  shootingStar.x += shootingStar.dx;
  shootingStar.y += shootingStar.dy;
  shootingStar.life++;
  shootingStar.alpha = 1 - shootingStar.life / shootingStar.maxLife;
  // Remove if faded or out of bounds
  if (
    shootingStar.life > shootingStar.maxLife ||
    shootingStar.x > canvas.width + 50 ||
    shootingStar.y > canvas.height + 50
  ) {
    shootingStar = null;
    nextShootingStarTime = Date.now() + Math.random() * 4000 + 2000;
  }
}

function animate() {
  drawGalaxyGradient();
  drawStars();
  updateStars();
  drawShootingStar();
  updateShootingStar();
  // Launch new shooting star if time
  if (!shootingStar && Date.now() > nextShootingStarTime) {
    shootingStar = createShootingStar();
  }
  requestAnimationFrame(animate);
}

function onResize() {
  resizeCanvas();
  initStars();
}

window.addEventListener('resize', onResize);
resizeCanvas();
initStars();
animate(); 