// My Zini Digital ERP — 3-Minute (180s) Full Dialogue-Synced Stickman Demo (30 fps = 5400 frames)
const DESK_HERO = [650, 560];
const DESK_FRIEND = [1270, 560];

// Walking choreography across acts
const walkAdvisorIn = makeWalk({ pts: [[1860, 740], [1540, 720], [1270, 690]], t0: 6, t1: 14, steps: 8, scale: () => 0.72 });
const walkStudentRfid = makeWalk({ pts: [[220, 770], [680, 770], [920, 770]], t0: 56, t1: 66, steps: 9, scale: () => 0.70 });
const walkStudentOut = makeWalk({ pts: [[920, 770], [1400, 770], [2020, 770]], t0: 74, t1: 86, steps: 10, scale: () => 0.70 });
const walkTeacherIn = makeWalk({ pts: [[1880, 760], [1560, 750], [1440, 745]], t0: 126, t1: 134, steps: 7, scale: () => 0.72 });

// Exact Gemini 3.8 TTS speaking windows [startSec, endSec]
const HERO_SPEAKS = [[0.5, 9.8], [38.0, 44.0], [68.5, 75.0], [102.5, 109.0], [136.5, 143.0]];
const ADVISOR_SPEAKS = [[10.2, 19.5], [25.5, 37.8], [55.5, 68.2], [90.5, 102.2], [125.5, 136.2], [155.5, 170.5]];

function isSpeaking(t, windows) {
  for (const [a, b] of windows) {
    if (t >= a && t <= b) return true;
  }
  return false;
}

function lipOpen(t, windows) {
  if (!isSpeaking(t, windows)) return 0;
  return 0.25 + 0.55 * Math.abs(Math.sin(t * 14.5) * Math.cos(t * 6.3));
}

function gestureHand(t, baseX, baseY, ampX, ampY, speed) {
  return [baseX + Math.sin(t * speed) * ampX, baseY + Math.cos(t * speed * 1.3) * ampY];
}

function drawCaption(c, t, cam, title, sub, badge) {
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  const w = c.canvas.width, h = c.canvas.height;
  if (badge) {
    c.fillStyle = 'rgba(15, 23, 42, 0.80)';
    c.strokeStyle = 'rgba(96, 165, 250, 0.75)';
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(48, 42, 430, 52, 12);
    c.fill();
    c.stroke();
    c.fillStyle = '#93c5fd';
    c.font = '700 22px system-ui, sans-serif';
    c.fillText(badge, 68, 76);
  }
  if (title) {
    c.fillStyle = 'rgba(15, 23, 42, 0.86)';
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
  const count = Math.round(amount * 9);
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

function drawRfidKiosk(c, t) {
  if (t < 55 || t >= 90) return;
  c.save();
  const kx = 995, ky = 515;
  c.fillStyle = '#1e293b';
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 3;
  c.beginPath();
  c.roundRect(kx, ky, 54, 150, 10);
  c.fill();
  c.stroke();

  const tapped = t >= 66 && t <= 72;
  c.fillStyle = tapped ? '#22c55e' : '#38bdf8';
  c.beginPath();
  c.roundRect(kx + 10, ky + 18, 34, 28, 6);
  c.fill();
  if (tapped) {
    c.fillStyle = '#4ade80';
    c.font = '800 18px system-ui, sans-serif';
    c.fillText('RFID OK ✓', kx - 12, ky - 14);
  }
  c.restore();
}

function drawErpScreen(c, t, mode) {
  c.save();
  const bx = 810, by = 195, bw = 300, bh = 195;
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
  const spk = isSpeaking(t, HERO_SPEAKS);
  const stressed = t < 25;
  const celebrating = (t >= 102 && t <= 112) || t >= 158;
  const hands = stressed
    ? {
        l: gestureHand(t, -35, -75, 10, 8, 3.2),
        r: gestureHand(t, 120, 120, 18, 12, 5.0),
      }
    : celebrating
      ? {
          l: gestureHand(t, -125, -45, 22, 26, 5.5),
          r: gestureHand(t, 135, -50, 22, 26, 5.2),
        }
      : spk
        ? {
            l: gestureHand(t, -95, 70, 22, 18, 4.8),
            r: gestureHand(t, 130, 55, 28, 22, 5.6),
          }
        : {
            l: [-95, 145],
            r: gestureHand(t, 110, 130, 12, 8, 2.2),
          };

  return {
    x: DESK_HERO[0],
    y: DESK_HERO[1],
    s: 1,
    face: 1,
    noLegs: true,
    breath: t * 2.2,
    bend: stressed ? 0.14 : spk ? 0.06 * Math.sin(t * 2.5) : 0.02 * Math.sin(t * 1.4),
    headY: spk ? Math.sin(t * 6.5) * 6 : Math.sin(t * 2.0) * 3,
    look: kf(t, [[0, 0.2], [12, 0.7], [55, 0.6], [120, 0.7], [155, 0.5]]),
    lookY: stressed ? 0.35 : 0.05,
    brow: stressed ? -0.45 : celebrating ? 0.65 : 0.35,
    sad: stressed ? 0.55 : 0,
    laugh: celebrating ? 1 : 0,
    open: lipOpen(t, HERO_SPEAKS),
    mouth: stressed ? -0.35 : 0.55,
    tilt: stressed ? 0.1 : spk ? Math.sin(t * 3.1) * 0.08 : -0.02,
    blink: blinkAt(t, [3, 9, 17, 25, 34, 46, 58, 72, 86, 102, 118, 134, 150, 168]),
    hands,
    showH: { l: true, r: true },
  };
}

function friendPose(t) {
  if (t < 14) {
    const w = walkAdvisorIn.at(t);
    return walkPose({
      x: w.c[0],
      y: standY(w.c[1], w.s),
      s: w.s,
      face: -1,
      breath: t * 2.3,
      brow: 0.25,
      mouth: 0.3,
      open: lipOpen(t, ADVISOR_SPEAKS),
      look: -0.6,
      blink: blinkAt(t, [4, 11]),
    }, w);
  }
  const spk = isSpeaking(t, ADVISOR_SPEAKS);
  const pointing = (t >= 26 && t <= 38) || (t >= 90 && t <= 102);
  const waving = t >= 156;
  const hands = pointing
    ? {
        l: gestureHand(t, -155, -25, 25, 22, 4.5),
        r: gestureHand(t, 95, 85, 16, 14, 3.8),
      }
    : waving
      ? {
          l: gestureHand(t, -135, -55, 26, 28, 5.8),
          r: gestureHand(t, 125, -45, 24, 24, 5.2),
        }
      : spk
        ? {
            l: gestureHand(t, -120, 45, 28, 22, 5.2),
            r: gestureHand(t, 95, 70, 20, 16, 4.4),
          }
        : {
            l: gestureHand(t, -100, 125, 10, 8, 2.0),
            r: [95, 145],
          };

  return {
    x: DESK_FRIEND[0],
    y: DESK_FRIEND[1],
    s: 1,
    face: -1,
    noLegs: true,
    breath: t * 2.1,
    bend: spk ? -0.05 * Math.sin(t * 2.4) : 0,
    headY: spk ? Math.sin(t * 6.0) * 6 : Math.sin(t * 1.9) * 3,
    look: -0.7,
    lookY: 0.05,
    brow: 0.4,
    laugh: waving ? 1 : 0,
    open: lipOpen(t, ADVISOR_SPEAKS),
    mouth: 0.55,
    tilt: spk ? Math.sin(t * 2.8) * 0.07 : -0.03,
    blink: blinkAt(t, [21, 33, 49, 64, 79, 95, 111, 129, 145, 162, 174]),
    hands,
    showH: { l: true, r: true },
  };
}

function studentPose(t) {
  if (t < 56 || t >= 86) return null;
  if (t < 66) {
    const w = walkStudentRfid.at(t);
    return walkPose({
      x: w.c[0],
      y: standY(w.c[1], w.s),
      s: w.s,
      face: 1,
      breath: t * 2.5,
      mouth: 0.4,
      look: 0.5,
      blink: blinkAt(t, [59, 64]),
    }, w);
  }
  if (t < 74) {
    // Tapping RFID card on kiosk!
    const tap = ease(seg(t, 66, 69)) * (1 - ease(seg(t, 71, 74)));
    return {
      x: 920,
      y: standY(770, 0.70),
      s: 0.70,
      face: 1,
      breath: t * 2.2,
      bend: tap * 0.12,
      mouth: 0.6,
      look: 0.7,
      hands: { r: [lerp(60, 125, tap), lerp(110, 15, tap)] },
      showH: { r: true },
    };
  }
  const w = walkStudentOut.at(t);
  return walkPose({
    x: w.c[0],
    y: standY(w.c[1], w.s),
    s: w.s,
    face: 1,
    breath: t * 2.5,
    mouth: 0.5,
    look: 0.6,
    blink: blinkAt(t, [78, 83]),
  }, w);
}

function teacherPose(t) {
  if (t < 126) return null;
  if (t < 134) {
    const w = walkTeacherIn.at(t);
    return walkPose({
      x: w.c[0],
      y: standY(w.c[1], w.s),
      s: w.s,
      face: -1,
      breath: t * 2.2,
      mouth: 0.5,
      look: -0.6,
      blink: blinkAt(t, [129, 132]),
    }, w, { arms: false });
  }
  const wave = t >= 156;
  return {
    x: 1440,
    y: standY(745, 0.72),
    s: 0.72,
    face: -1,
    breath: t * 2.1,
    headY: Math.sin(t * 3.0) * 4,
    brow: 0.4,
    laugh: wave ? 1 : 0,
    mouth: 0.6,
    look: -0.6,
    blink: blinkAt(t, [139, 148, 160, 171]),
    hands: {
      l: wave ? gestureHand(t, -120, -45, 22, 24, 5.5) : gestureHand(t, -110, 45, 16, 16, 3.6),
      r: [90, 120],
    },
    showH: { l: true, r: true },
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
      { x: lerp(920, 990, ease(u)), y: 520, z: lerp(0.95, 1.05, ease(u)), b: [2, 0.6, 0] },
      { x: lerp(990, 930, ease(u)), y: 515, z: lerp(1.04, 0.94, ease(u)), b: [2, 0.6, 0] },
      { x: lerp(930, 1020, ease(u)), y: 515, z: lerp(0.94, 0.98, ease(u)), b: [2, 0.6, 0] },
      { x: 980, y: 540, z: lerp(1.0, 0.84, ease(u)), b: [2, 0.4, 0] },
    ];
    return shots[s] || shots[0];
  },
  draw(t, cam) {
    const bg = layer('bg', cam, 0.8);
    drawRoom(bg, t < 25, t);

    const actors = layer('actors', cam);
    actor(actors, 'hero', HERO, heroPose(t), cam, 'rgba(255,190,150,0.85)', -1);
    actor(actors, 'friend', FRIEND, friendPose(t), cam, 'rgba(147,197,253,0.85)', 1);

    const fg = layer('fg', cam);
    drawRoomTable(fg);
    const paperAmount = t < 25 ? 1.0 : t < 55 ? 1 - ease(seg(t, 25, 50)) : 0;
    drawPaperStacks(fg, paperAmount);
    drawRfidKiosk(fg, t);

    const st = studentPose(t);
    if (st) actor(fg, 'student', GUEST_A, st, cam, 'rgba(196,181,253,0.9)', 1);

    const tc = teacherPose(t);
    if (tc) actor(fg, 'teacher', WOMAN, tc, cam, 'rgba(94,234,212,0.9)', -1);

    if (t >= 25) {
      const mode = t < 55 ? 'intro' : t < 90 ? 'rfid' : t < 125 ? 'fees' : t < 155 ? 'exams' : 'cta';
      drawErpScreen(fg, t, mode);
    }

    const [badge, title, sub] = sceneText(t);
    drawCaption(fg, t, cam, title, sub, badge);

    comp([['bg', cam.b[0]], ['actors', 0], ['fg', cam.b[2]]]);
  },
  plants() {
    return {
      friend: walkAdvisorIn.plants(),
      student: walkStudentRfid.plants().concat(walkStudentOut.plants()),
      teacher: walkTeacherIn.plants(),
    };
  },
};

say(25.0, 'latch');
say(55.0, 'door');
say(90.0, 'latch');
say(125.0, 'latch');
say(155.0, 'doorstop');
