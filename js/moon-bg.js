/* ============================================================
 * moon-bg.js —— Apollo 登月过程抽象背景动画
 * 深蓝夜空 + ASCII 原子像素 + 发射/奔月/绕月/着陆/返航
 * 非交互、低性能开销，仅在首页运行。
 * ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('moon-bg');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;
  var CYCLE = 84;              // 一轮完整流程的秒数
  var W = 0, H = 0, DPR = 1;
  var stars = [], motes = [];
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var last = 0;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    makeStars();
    makeMotes();
  }

  function makeStars() {
    stars = [];
    var n = Math.min(200, Math.floor(W * H / 6500));
    var chars = '·*+oO.';
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.35,
        a: Math.random() * 0.45 + 0.15,
        tw: Math.random() * TAU,
        ch: chars.charAt(Math.floor(Math.random() * chars.length))
      });
    }
  }

  function makeMotes() {
    motes = [];
    var n = Math.min(60, Math.floor(W * H / 20000));
    var chars = '01·.:*+';
    for (var i = 0; i < n; i++) {
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -Math.random() * 0.12 - 0.02,
        ch: chars.charAt(Math.floor(Math.random() * chars.length)),
        life: Math.random() * TAU
      });
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  /* ---------- 背景 ---------- */

  function drawSky() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#02030a');
    g.addColorStop(0.45, '#071129');
    g.addColorStop(1, '#0a1a3a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 深蓝色星云/大气辉光
    ctx.save();
    var rg = ctx.createRadialGradient(W * 0.85, H * 0.8, 0, W * 0.85, H * 0.8, H * 0.55);
    rg.addColorStop(0, 'rgba(38, 66, 130, 0.22)');
    rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawStars(time) {
    ctx.save();
    ctx.font = '9px "Courier New", monospace';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.0012 + s.tw));
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = '#cfe0ff';
      if (s.ch && s.r < 0.9) {
        ctx.fillText(s.ch, s.x, s.y);
      } else {
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
    }
    ctx.restore();
  }

  function drawMotes(time) {
    ctx.save();
    ctx.font = '10px "Courier New", monospace';
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      m.x += m.vx;
      m.y += m.vy;
      if (m.y < -10) { m.y = H + 8; m.x = Math.random() * W; }
      if (m.x < -10) m.x = W + 8;
      if (m.x > W + 10) m.x = -8;
      var alpha = 0.12 + 0.1 * Math.sin(time * 0.001 + m.life);
      ctx.globalAlpha = Math.max(0.04, alpha);
      ctx.fillStyle = '#9fb8e8';
      ctx.fillText(m.ch, m.x, m.y);
    }
    ctx.restore();
  }

  /* ---------- ASCII 原子像素 ---------- */

  function drawAtom(x, y, r, time, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(130, 180, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.7, r * 0.55, 0.6, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.7, r * 0.55, -0.6, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    // 原子核：像素块
    ctx.fillStyle = 'rgba(255, 214, 150, 0.7)';
    ctx.fillRect(-2, -2, 4, 4);
    ctx.fillRect(-6, 0, 3, 2);
    ctx.fillRect(3, -1, 2, 3);

    // 电子：ASCII 小圆点
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#a9c9ff';
    for (var i = 0; i < 3; i++) {
      var a = time * 0.0012 + i * 2.1;
      var ex = Math.cos(a) * r * 1.7;
      var ey = Math.sin(a) * r * 0.55;
      ctx.fillText('o', ex, ey);
    }
    ctx.restore();
  }

  /* ---------- 地月 ---------- */

  function drawEarth(x, y, r) {
    ctx.save();
    var glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.5);
    glow.addColorStop(0, 'rgba(70, 130, 255, 0.55)');
    glow.addColorStop(0.55, 'rgba(30, 70, 190, 0.22)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, TAU); ctx.fill();

    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#79bcff');
    g.addColorStop(0.55, '#2059b0');
    g.addColorStop(1, '#0a1f4c');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();

    ctx.fillStyle = 'rgba(180, 220, 255, 0.30)';
    ctx.fillRect(x - r * 0.45, y - r * 0.25, r * 0.28, r * 0.14);
    ctx.fillRect(x + r * 0.05, y + r * 0.18, r * 0.42, r * 0.16);
    ctx.restore();
  }

  function drawMoon(x, y, r) {
    ctx.save();
    var glow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 1.6);
    glow.addColorStop(0, 'rgba(220, 228, 250, 0.30)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, TAU); ctx.fill();

    var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#dbe0ec');
    g.addColorStop(0.6, '#929bb0');
    g.addColorStop(1, '#3b4355');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();

    // 陨石坑：低像素块
    ctx.fillStyle = 'rgba(40, 50, 72, 0.35)';
    ctx.fillRect(x - r * 0.48, y - r * 0.28, r * 0.16, r * 0.10);
    ctx.fillRect(x + r * 0.10, y + r * 0.18, r * 0.22, r * 0.15);
    ctx.fillRect(x + r * 0.32, y - r * 0.42, r * 0.10, r * 0.08);
    ctx.restore();
  }

  function drawTrajectory(ex, ey, mx, my) {
    ctx.save();
    ctx.setLineDash([3, 7]);
    ctx.strokeStyle = 'rgba(150, 190, 255, 0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.quadraticCurveTo(lerp(ex, mx, 0.5), H * 0.05, mx, my);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- 像素飞行器 ---------- */

  function drawRocket(x, y, s, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    // 尾焰
    ctx.fillStyle = 'rgba(255, 180, 80, 0.75)';
    ctx.fillRect(x - s * 0.5, y + s * 2.2, s, s * 2.5);
    // 箭体
    ctx.fillStyle = '#dfe8f5';
    ctx.fillRect(x - s * 0.5, y - s * 2.2, s, s * 4.4);
    // 头部
    ctx.fillStyle = '#c6d6ea';
    ctx.fillRect(x - s * 0.3, y - s * 3.2, s * 0.6, s);
    // 舷窗
    ctx.fillStyle = '#6fa8ff';
    ctx.fillRect(x - s * 0.22, y - s * 0.8, s * 0.44, s * 0.7);
    ctx.restore();
  }

  function drawLander(x, y, s, landed, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#c9d4e4';
    // 着陆支架
    ctx.fillRect(x - s * 1.6, y + s * 0.4, s * 0.5, s * 2.2);
    ctx.fillRect(x + s * 1.1, y + s * 0.4, s * 0.5, s * 2.2);
    ctx.strokeStyle = '#9fb2c8';
    ctx.lineWidth = Math.max(1, s * 0.12);
    ctx.beginPath(); ctx.moveTo(x - s * 1.6, y + s * 0.4); ctx.lineTo(x - s * 2.2, y + s * 2.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + s * 1.1, y + s * 0.4); ctx.lineTo(x + s * 1.7, y + s * 2.6); ctx.stroke();
    // 上升级/指令舱
    ctx.fillStyle = '#e8eef7';
    ctx.fillRect(x - s * 0.8, y - s * 2.0, s * 1.6, s * 2.4);
    ctx.fillStyle = '#a9c8f0';
    ctx.fillRect(x - s * 0.4, y - s * 1.0, s * 0.8, s * 0.7);
    if (landed) {
      drawFlag(x + s * 1.5, y + s * 0.2, s);
    }
    ctx.restore();
  }

  function drawFlag(x, y, s) {
    ctx.fillStyle = '#d5dae5';
    ctx.fillRect(x, y - s * 4, s * 0.35, s * 4);
    ctx.fillStyle = '#ff5a5a';
    ctx.fillRect(x + s * 0.35, y - s * 4, s * 2.2, s * 1.1);
    ctx.fillStyle = '#dfe8f5';
    ctx.fillRect(x + s * 0.35, y - s * 2.9, s * 2.2, s * 0.22);
  }

  /* ---------- 过程 ---------- */

  function getCraft(p) {
    var ex = W * 0.16, ey = H * 0.72;
    var mx = W * 0.82, my = H * 0.28;
    var craft = { x: 0, y: 0, type: 'rocket', s: 3, alpha: 0.7 };

    if (p < 0.14) {
      var q = p / 0.14;
      craft.x = lerp(W * 0.14, ex, q);
      craft.y = lerp(H * 0.98, ey, ease(q));
      craft.type = 'rocket';
      craft.alpha = 0.85;
    } else if (p < 0.36) {
      var q0 = (p - 0.14) / 0.22;
      craft.x = lerp(ex, W * 0.50, q0);
      craft.y = lerp(ey, H * 0.06, Math.sin(q0 * Math.PI) * 0.9);
      craft.type = 'rocket';
      craft.s = 2.2;
      craft.alpha = 0.5;
    } else if (p < 0.52) {
      var q1 = (p - 0.36) / 0.16;
      craft.x = lerp(W * 0.50, mx, q1);
      craft.y = lerp(H * 0.06, my - 60, ease(q1));
      craft.type = 'rocket';
      craft.s = 2;
      craft.alpha = 0.42;
    } else if (p < 0.68) {
      var q2 = (p - 0.52) / 0.16;
      craft.x = lerp(mx - 40, mx - 14, q2);
      craft.y = lerp(my - 70, my + 14, ease(q2));
      craft.type = 'lander';
      craft.s = 2.6;
      craft.alpha = 0.9;
    } else if (p < 0.86) {
      craft.x = mx - 14;
      craft.y = my + 20;
      craft.type = 'lander';
      craft.s = 2.6;
      craft.alpha = 0.95;
      craft.landed = true;
    } else {
      var q3 = (p - 0.86) / 0.14;
      craft.x = lerp(mx - 14, ex, q3);
      craft.y = lerp(my + 20, ey, ease(q3));
      craft.type = 'rocket';
      craft.s = 2;
      craft.alpha = 0.35;
    }
    return craft;
  }

  function drawPhaseText(p, time) {
    var phases = [
      [0.00, 0.14, 'LAUNCH'],
      [0.14, 0.36, 'TRANS LUNAR INJECTION'],
      [0.36, 0.52, 'LUNAR ORBIT'],
      [0.52, 0.68, 'DESCENT'],
      [0.68, 0.86, 'LANDING · TRANQUILITY BASE'],
      [0.86, 1.00, 'RETURN']
    ];
    var label = '';
    for (var i = 0; i < phases.length; i++) {
      if (p >= phases[i][0] && p < phases[i][1]) {
        label = phases[i][2];
        break;
      }
    }
    if (!label) return;

    ctx.save();
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(160, 190, 235, 0.32)';
    ctx.fillText(label, W / 2, H - 104);

    // 意识流短语
    var words = [
      [0.68, 0.86, 'one small step for man…'],
      [0.52, 0.68, 'the eagle has landed'],
      [0.14, 0.36, 'we choose to go to the moon']
    ];
    for (var j = 0; j < words.length; j++) {
      if (p >= words[j][0] && p < words[j][1]) {
        ctx.font = '10px "Courier New", monospace';
        ctx.globalAlpha = 0.15 + 0.08 * Math.sin(time * 0.002);
        ctx.fillStyle = '#b8d0ff';
        ctx.fillText(words[j][2], W / 2, H - 84);
        break;
      }
    }
    ctx.restore();
  }

  /* ---------- 主循环 ---------- */

  function draw(time) {
    drawSky();
    drawStars(time);
    drawMotes(time);

    var ex = W * 0.16, ey = H * 0.72;
    var mx = W * 0.82, my = H * 0.28;
    var earthR = Math.max(22, Math.min(44, W * 0.032));
    var moonR = Math.max(46, Math.min(82, W * 0.058));

    drawTrajectory(ex, ey, mx, my);
    drawEarth(ex, ey, earthR);
    drawMoon(mx, my, moonR);
    drawAtom(W * 0.10, H * 0.16, 16, time, 0.28);

    var p = (time / 1000 % CYCLE) / CYCLE;
    var craft = getCraft(p);
    if (craft.type === 'rocket') {
      drawRocket(craft.x, craft.y, craft.s, craft.alpha);
    } else {
      drawLander(craft.x, craft.y, craft.s, craft.landed, craft.alpha);
    }

    drawPhaseText(p, time);
  }

  function frame(now) {
    if (document.hidden) {
      requestAnimationFrame(frame);
      return;
    }
    if (!last) last = now;
    var dt = Math.min(now - last, 100);
    last = now;
    if (!reduced || dt > 50) {
      draw(now);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    last = 0;
  });

  resize();
  requestAnimationFrame(frame);
})();
