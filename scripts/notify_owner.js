#!/usr/bin/env node
/**
 * Owner Escalation & Daily SEO Digest Notifier via local OpenWA (port 2785).
 * Usage:
 *   node scripts/notify_owner.js --text "Daily SEO report..."
 *   node scripts/notify_owner.js --ai-call "Ask owner for GSC login..."
 *   node scripts/notify_owner.js --dry-run --text "Test"
 */
const fs = require('fs');
const path = require('path');

const OPENWA_URL = process.env.OPENWA_URL || 'http://127.0.0.1:2785';
const API_KEY_PATH = process.env.OPENWA_API_KEY_PATH || '/home/ubuntu/OpenWA/data/.api-key';
const OWNER_PHONE = process.env.OWNER_PHONE || '919241981083';
const OWNER_CHAT_ID = `${OWNER_PHONE}@c.us`;

function parseArgs(argv) {
  const args = { dryRun: false, mode: 'text', message: '' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--ai-call') {
      args.mode = 'ai-call';
      args.message = argv[++i] || '';
    } else if (argv[i] === '--text') {
      args.mode = 'text';
      args.message = argv[++i] || '';
    }
  }
  return args;
}

async function getReadySessionId(apiKey) {
  const res = await fetch(`${OPENWA_URL}/api/sessions`, {
    headers: { 'X-Api-Key': apiKey },
  });
  if (!res.ok) throw new Error(`Failed to list OpenWA sessions: HTTP ${res.status}`);
  const data = await res.json();
  const sessions = Array.isArray(data) ? data : data.sessions || [];
  const ready = sessions.find((s) => s.status === 'ready') || sessions[0];
  if (!ready || !ready.id) throw new Error('No active OpenWA session found');
  return ready.id;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.message) {
    console.error('Usage: node scripts/notify_owner.js [--dry-run] --text "<msg>" | --ai-call "<instruction>"');
    process.exit(1);
  }

  if (!fs.existsSync(API_KEY_PATH)) {
    throw new Error(`OpenWA API key file not found at ${API_KEY_PATH}`);
  }
  const apiKey = fs.readFileSync(API_KEY_PATH, 'utf8').trim();
  const sessionId = await getReadySessionId(apiKey);

  if (opts.dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      openwaUrl: OPENWA_URL,
      sessionId,
      mode: opts.mode,
      target: opts.mode === 'text' ? OWNER_CHAT_ID : OWNER_PHONE,
      messagePreview: opts.message.slice(0, 120),
    }, null, 2));
    return;
  }

  const endpoint =
    opts.mode === 'ai-call'
      ? `${OPENWA_URL}/api/sessions/${sessionId}/calls/ai/start`
      : `${OPENWA_URL}/api/sessions/${sessionId}/messages/send-text`;

  const payload =
    opts.mode === 'ai-call'
      ? { phoneNumber: OWNER_PHONE, systemInstruction: opts.message }
      : { chatId: OWNER_CHAT_ID, text: opts.message };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`OpenWA ${opts.mode} failed (HTTP ${res.status}): ${body}`);
  }
  console.log(`OpenWA ${opts.mode} sent successfully to ${OWNER_PHONE}:`, body.slice(0, 300));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
