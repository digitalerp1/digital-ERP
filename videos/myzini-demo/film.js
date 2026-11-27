// My Zini Digital ERP — 3-Minute (180s) Stickman Product Demo Film (30 fps = 5400 frames)
const DESK_HERO = [650, 560];
const DESK_FRIEND = [1270, 560];
const walkIn = makeWalk({ pts: [[1820, 740], [1500, 720], [1270, 690]], t0: 8, t1: 16, steps: 8, scale: () => 0.72 });

function drawCaption(c, t, cam, title, sub, badge) {
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  const w = c.canvas.width, h = c.canvas.height;
  // Top-left module badge
  if (badge) {
    c.fillStyle = 'rgba(15, 23, 42, 0.78)';
    c.strokeStyle = 'rgba(96, 165, 250, 0.7)';
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(48, 42, 420, 52, 12);
    c.fill();
    c.stroke();
    c.fillStyle = '#93c5fd';
    c.font = '700 22px system-ui, sans-serif';
    c.fillText(badge, 68, 76);
  }
  // Bottom cinematic subtitle bar
  if (title) {
    c.fillStyle = 'rgba(15, 23, 42, 0.84)';
    c.beginPath();
    c.roundRect(120, h - 165, w - 240, 125, 16);
    c.fill();
    c.fillStyle = '#f8fafc';
    c.font = '800 34px system-ui, sans-serif';
    c.fillText(title, 155, h - 110);
    if (sub) {
      c.fillStyle = '#cbd5e1';
      c.font = '500 24px system-ui, sans-serif';
      c.fillText(sub, 155, h - 68);
    }
  }
  c.restore();
}

function drawPaperStacks(c, amount) {
  if (amount <= 0.02) return;
  c.save();
  const count = Math.round(amount * 8);
  for (let i = 0; i < count; i++) {
    const px = 760 + (i % 3) * 72;
    const py = 540 - Math.floor(i / 3) * 26;
    c.fillStyle = i % 2 === 0 ? '#e2e8f0' : '#cbd5e1';
    c.fillRect(px, py, 64, 22);
    c.strokeStyle = '#64748b';
    c.lineWidth = 1.5;
    c.strokeRect(px, py, 64, 22);
  }
  c.restore();
}

function drawErpScreen(c, t, mode) {
  c.save();
  const bx = 810, by = 210, bw = 300, bh = 190;
  c.fillStyle = '#0f172a';
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 4;
  c.beginPath();
  c.roundRect(bx, by, bw, bh, 14);
  c.fill();
  c.stroke();

  c.fillStyle = '#38bdf8';
  c.font = '700 18px system-ui, sans-serif';
  c.fillText('MY ZINI DIGITAL ERP', bx + 20, by + 34);

  c.fillStyle = '#e2e8f0';
  c.font = '600 15px system-ui, sans-serif';
  if (mode === 'intro') {
    c.fillText('50+ Cloud School Modules', bx + 20, by + 72);
    c.fillStyle = '#4ade80';
    c.fillText('• ₹100 One-Time Registration', bx + 20, by + 102);
    c.fillText('• Web + Android + Parent App', bx + 20, by + 130);
    const prog = Math.min(1, Math.max(0, (t - 25) / 25));
    c.fillStyle = '#1e293b';
    c.fillRect(bx + 20, by + 150, 260, 12);
    c.fillStyle = '#38bdf8';
    c.fillRect(bx + 20, by + 150, 260 * prog, 12);
  } else if (mode === 'rfid') {
    c.fillText('RFID & Daily Attendance', bx + 20, by + 72);
    const pulse = Math.floor((t * 2) % 3);
    c.fillStyle = '#4ade80';
    c.fillText('• Card Scanned: Present ✓', bx + 20, by + 104);
    c.fillStyle = pulse === 0 ? '#fbbf24' : '#38bdf8';
    c.fillText('• Parent WhatsApp Alert Sent', bx + 20, by + 134);
    const count = 420 + Math.floor(((t - 55) / 35) * 195);
    c.fillStyle = '#93c5fd';
    c.fillText(`Present Today: ${count} / 623`, bx + 20, by + 164);
  } else if (mode === 'fees') {
    c.fillText('Fee Collection & Dues Radar', bx + 20, by + 72);
    c.fillStyle = '#4ade80';
    c.fillText('• 1-Click QR Fee Receipt', bx + 20, by + 104);
    c.fillText('• Auto WhatsApp Dues Alert', bx + 20, by + 134);
    const amt = 48500 + Math.floor(((t - 90) / 35) * 62000);
    c.fillStyle = '#fbbf24';
    c.fillText(`Today Inflow: ₹${amt.toLocaleString('en-IN')}`, bx + 20, by + 164);
  } else if (mode === 'exams') {
    c.fillText('Exams, ID & Admit Cards', bx + 20, by + 72);
    c.fillStyle = '#fbbf24';
    c.fillText('• 17+ Admit Card Styles', bx + 20, by + 104);
    c.fillStyle = '#4ade80';
    c.fillText('• Online Marksheets Ready', bx + 20, by + 134);
    c.fillStyle = '#38bdf8';
    c.fillText('• 1-Click Bulk PDF Export', bx + 20, by + 164);
  } else {
    c.fillText('All-in-One School Command', bx + 20, by + 72);
    c.fillStyle = '#4ade80';
    c.fillText('• myzini.digitalerp.shop', bx + 20, by + 104);
    c.fillStyle = '#93c5fd';
    c.fillText('• Demo: +91 9241981083', bx + 20, by + 134);
    c.fillStyle = '#fbbf24';
    c.fillText('• Start Your Free Trial Now!', bx + 20, by + 164);
  }
  c.restore();
}

function heroPose(t) {
  const stressed = t < 28;
  return {
    x: DESK_HERO[0],
    y: DESK_HERO[1],
    s: 1,
    face: 1,
    noLegs: true,
    breath: t * 2.1,
    look: kf(t, [[0, 0.2], [12, 0.7], [55, 0.6], [120, 0.7], [160, 0.4]]),
    lookY: stressed ? 0.35 : 0.05,
    brow: stressed ? -0.45 : kf(t, [[28, 0.2], [55, 0.5], [150, 0.6]]),
    sad: stressed ? 0.5 : 0,
    mouth: stressed ? -0.35 : talk(t, 32, 165) * 0.4 + 0.35,
    tilt: stressed ? 0.08 : -0.03,
    blink: blinkAt(t, [3, 9, 17, 25, 34, 46, 58, 72, 86, 102, 118, 134, 150, 168]),
    hands: {},
  };
}

function friendPose(t) {
  if (t < 16) {
    const w = walkIn.at(t);
    return walkPose({
      x: w.c[0],
      y: standY(w.c[1], w.s),
      s: w.s,
      face: -1,
      breath: t * 2.2,
      brow: 0.2,
      mouth: 0.25,
      look: -0.6,
      blink: blinkAt(t, [4, 11]),
    }, w);
  }
  return {
    x: DESK_FRIEND[0],
    y: DESK_FRIEND[1],
    s: 1,
    face: -1,
    noLegs: true,
    breath: t * 2.0,
    look: -0.7,
    lookY: 0.05,
    brow: 0.35,
    mouth: talk(t, 26, 172) * 0.45 + 0.3,
    tilt: -0.04,
    blink: blinkAt(t, [21, 33, 49, 64, 79, 95, 111, 129, 145, 162, 174]),
    hands: {},
  };
}

function sceneText(t) {
  if (t < 25) {
    return ['ACT 1 • PAPERWORK CHAOS', 'Still Managing Your School on Paper Registers?', 'Manual attendance, fee dues & marksheets waste hours every week.'];
  }
  if (t < 55) {
    return ['ACT 2 • MY ZINI DIGITAL ERP', 'Meet My Zini Digital ERP — 50+ Modules in One Platform', 'Students, Staff, Fees, Exams, Transport & Hostel — ₹100 Registration.'];
  }
  if (t < 90) {
    return ['ACT 3 • SMART RFID ATTENDANCE', '1-Tap Class Attendance & Instant RFID Card Polling', 'Auto-marks Present/Absent & sends instant WhatsApp alerts to parents.'];
  }
  if (t < 125) {
    return ['ACT 4 • FEE & DUES AUTOMATION', 'Collect Fees Faster with QR Receipts & WhatsApp Reminders', 'Track class-wise dues, sibling concessions, expenses & profit/loss live.'];
  }
  if (t < 155) {
    return ['ACT 5 • EXAMS, ID & ADMIT CARDS', 'Publish Online Results & Generate 17+ Admit Card Styles', 'Print student ID cards, marksheets & transfer certificates in one click.'];
  }
  return ['ACT 6 • DIGITIZE TODAY', 'Start Your Digital School in Minutes at myzini.digitalerp.shop', 'Visit digitalerp.shop or WhatsApp +91 9241981083 for a Free Demo!'];
}

FILM = {
  dur: 180,
  cuts: [0, 750, 1650, 2700, 3750, 4650, 5400],
  fadeIn: 0.6,
  fadeOut: 0.8,
  warm(t) {
    return t > 155 ? ease(seg(t, 155, 170)) * 0.45 : 0;
  },
  cam(s, u, t) {
    const shots = [
      { x: lerp(960, 880, ease(u)), y: 540, z: lerp(0.86, 0.96, ease(u)), b: [2, 0.5, 0] },
      { x: lerp(960, 960, u), y: 520, z: lerp(0.92, 1.04, ease(u)), b: [2, 0.6, 0] },
      { x: lerp(920, 990, ease(u)), y: 510, z: lerp(1.0, 1.08, ease(u)), b: [2, 0.6, 0] },
      { x: lerp(990, 930, ease(u)), y: 515, z: lerp(1.04, 0.94, ease(u)), b: [2, 0.6, 0] },
      { x: lerp(930, 960, ease(u)), y: 505, z: lerp(0.96, 1.06, ease(u)), b: [2, 0.6, 0] },
      { x: 960, y: 540, z: lerp(1.02, 0.85, ease(u)), b: [2, 0.4, 0] },
    ];
    return shots[s] || shots[0];
  },
  draw(t, cam, shot) {
    const bg = layer('bg', cam, 0.8);
    drawRoom(bg, t < 25, t);

    const actors = layer('actors', cam);
    actor(actors, 'hero', HERO, heroPose(t), cam, 'rgba(255,190,150,0.85)', -1);
    actor(actors, 'friend', FRIEND, friendPose(t), cam, 'rgba(147,197,253,0.85)', 1);

    const fg = layer('fg', cam);
    drawRoomTable(fg);
    const paperAmount = t < 25 ? 1.0 : t < 55 ? 1 - ease(seg(t, 25, 50)) : 0;
    drawPaperStacks(fg, paperAmount);

    if (t >= 25) {
      const mode = t < 55 ? 'intro' : t < 90 ? 'rfid' : t < 125 ? 'fees' : t < 155 ? 'exams' : 'cta';
      drawErpScreen(fg, t, mode);
    }

    const [badge, title, sub] = sceneText(t);
    drawCaption(fg, t, cam, title, sub, badge);

    comp([['bg', cam.b[0]], ['actors', 0], ['fg', cam.b[2]]]);
  },
  plants() {
    return { friend: walkIn.plants() };
  },
};

say(25.0, 'latch');
say(55.0, 'door');
say(90.0, 'latch');
say(125.0, 'latch');
say(155.0, 'doorstop');
