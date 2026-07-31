/**
 * reportImage.ts
 *
 * Renders a progress report as a JPG image (canvas based, matching the
 * Neon Terminal / Cyberpunk design), triggers its download, then opens a
 * companion window explaining how to email it to the RSSI.
 *
 * Replaces the former "send to RSSI" backend notification, which relied on
 * the Manus platform notification service and is unavailable outside it.
 */

import type { ProgressReport } from './progressReport';

export const RSSI_EMAIL = 'louis.texier@statera-corp.com';

// ─── Canvas rendering ────────────────────────────────────────────────

function drawReport(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  report: ProgressReport,
  s: number,
) {
  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = 'rgba(0,240,255,0.03)';
  ctx.lineWidth = 1;
  const grid = 40 * s;
  for (let x = 0; x <= W; x += grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Outer border + corner accents
  ctx.strokeStyle = 'rgba(0,240,255,0.2)';
  ctx.lineWidth = 1 * s;
  ctx.strokeRect(8 * s, 8 * s, W - 16 * s, H - 16 * s);

  const cLen = 40 * s, cOff = 12 * s, cW = 2 * s;
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(cOff, cOff, cLen, cW); ctx.fillRect(cOff, cOff, cW, cLen);
  ctx.fillRect(W - cOff - cLen, cOff, cLen, cW); ctx.fillRect(W - cOff - cW, cOff, cW, cLen);
  ctx.fillRect(cOff, H - cOff - cW, cLen, cW); ctx.fillRect(cOff, H - cOff - cLen, cW, cLen);
  ctx.fillRect(W - cOff - cLen, H - cOff - cW, cLen, cW); ctx.fillRect(W - cOff - cW, H - cOff - cLen, cW, cLen);

  const M = 50 * s; // content margin

  const gradLine = (y: number, w: number, color: string, cx = W / 2) => {
    const g = ctx.createLinearGradient(cx - w / 2, y, cx + w / 2, y);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.5, color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(cx - w / 2, y, w, 1 * s);
  };

  const sectionTitle = (label: string, y: number) => {
    ctx.textAlign = 'left';
    ctx.font = `bold ${11 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(label, M, y);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(M, y + 8 * s, W - M * 2, 1 * s);
  };

  let y = 46 * s;

  // ── Header ──
  ctx.textAlign = 'center';
  ctx.font = `bold ${22 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = 'rgba(0,240,255,0.4)';
  ctx.shadowBlur = 20 * s;
  ctx.fillText('STATERA_Academy', W / 2, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  y += 18 * s;

  ctx.font = `${10 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('RAPPORT DE PROGRESSION — FORMATION CYBERSÉCURITÉ', W / 2, y);
  y += 14 * s;
  gradLine(y, 320 * s, '#00f0ff');
  y += 30 * s;

  // ── Collaborator ──
  ctx.textAlign = 'left';
  ctx.font = `${9 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('COLLABORATEUR', M, y);
  ctx.textAlign = 'right';
  ctx.fillText('DATE DU RAPPORT', W - M, y);
  y += 18 * s;

  ctx.textAlign = 'left';
  ctx.font = `bold ${16 * s}px "Space Grotesk", "JetBrains Mono", sans-serif`;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(report.userName || 'Agent Cyber', M, y);
  ctx.textAlign = 'right';
  ctx.font = `${10 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(report.date, W - M, y);
  y += 26 * s;

  // ── Stats row ──
  const stats = [
    { v: `Nv.${report.level.level}`, l: report.level.title.toUpperCase(), c: report.level.color },
    { v: `${report.totalXP}`, l: 'XP TOTAL', c: '#00ff88' },
    { v: `${report.avgScore}%`, l: 'SCORE MOYEN', c: '#f59e0b' },
    { v: `${report.completedModules}/${report.totalModules}`, l: 'MISSIONS', c: '#00f0ff' },
  ];
  const sG = 12 * s;
  const sW = (W - M * 2 - sG * (stats.length - 1)) / stats.length;
  const sH = 56 * s;
  let sx = M;
  stats.forEach(st => {
    ctx.fillStyle = `${st.c}08`;
    ctx.fillRect(sx, y, sW, sH);
    ctx.strokeStyle = `${st.c}30`;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(sx, y, sW, sH);

    ctx.textAlign = 'center';
    ctx.font = `bold ${20 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = st.c;
    ctx.shadowColor = `${st.c}50`;
    ctx.shadowBlur = 10 * s;
    ctx.fillText(st.v, sx + sW / 2, y + 26 * s);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.font = `${7.5 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#64748b';
    ctx.fillText(st.l, sx + sW / 2, y + 44 * s);
    sx += sW + sG;
  });
  y += sH + 34 * s;

  // ── Modules detail ──
  sectionTitle(`DÉTAIL DES MISSIONS (${report.completedModules}/${report.totalModules})`, y);
  y += 28 * s;

  report.moduleDetails.forEach(mod => {
    const rowH = 26 * s;
    ctx.fillStyle = 'rgba(15,23,42,0.5)';
    ctx.fillRect(M, y - 14 * s, W - M * 2, rowH - 4 * s);

    // Status marker
    const done = mod.completed;
    ctx.textAlign = 'left';
    ctx.font = `bold ${12 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = done ? '#00ff88' : '#475569';
    ctx.fillText(done ? '✓' : '—', M + 10 * s, y);

    // Module name
    ctx.font = `${11 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#e2e8f0';
    let name = mod.name;
    const maxNameW = W - M * 2 - 130 * s;
    while (ctx.measureText(name).width > maxNameW && name.length > 4) {
      name = name.slice(0, -2);
    }
    if (name !== mod.name) name += '…';
    ctx.fillText(name, M + 32 * s, y);

    // Score
    const scoreTxt = mod.score !== null ? `${mod.score}%` : 'Non commencé';
    const scoreCol = mod.score !== null
      ? (mod.score >= 80 ? '#00ff88' : mod.score >= 50 ? '#f59e0b' : '#ff0066')
      : '#64748b';
    ctx.textAlign = 'right';
    ctx.font = `bold ${11 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = scoreCol;
    ctx.fillText(scoreTxt, W - M - 10 * s, y);

    y += rowH;
  });

  y += 18 * s;

  // ── Badges ──
  sectionTitle(`BADGES OBTENUS (${report.badges.length})`, y);
  y += 28 * s;

  if (report.badges.length > 0) {
    const bG = 8 * s, bPW = 12 * s, bFS = 10 * s;
    ctx.font = `${bFS}px "JetBrains Mono", monospace`;
    let bx = M;
    const bH = 24 * s;
    report.badges.forEach(badge => {
      const bw = ctx.measureText(badge).width + bPW * 2;
      if (bx + bw > W - M) { bx = M; y += bH + bG; }
      ctx.fillStyle = 'rgba(0,240,255,0.04)';
      ctx.fillRect(bx, y - 14 * s, bw, bH);
      ctx.strokeStyle = 'rgba(0,240,255,0.25)';
      ctx.lineWidth = 1 * s;
      ctx.strokeRect(bx, y - 14 * s, bw, bH);
      ctx.textAlign = 'left';
      ctx.font = `${bFS}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(badge, bx + bPW, y);
      bx += bw + bG;
    });
    y += bH + 10 * s;
  } else {
    ctx.textAlign = 'left';
    ctx.font = `${10 * s}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('Aucun badge obtenu pour le moment', M, y);
    y += 20 * s;
  }

  // ── Footer ──
  const fy = H - 42 * s;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(M, fy - 18 * s, W - M * 2, 1 * s);
  ctx.textAlign = 'left';
  ctx.font = `${8.5 * s}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('Généré par STATERA_Academy — Formation Cybersécurité 2026', M, fy);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#00f0ff';
  ctx.fillText('À TRANSMETTRE AU RSSI', W - M, fy);
}

// ─── Public API ──────────────────────────────────────────────────────

export function buildReportFileName(report: ProgressReport): string {
  const safeName = (report.userName || 'Agent').replace(/\s+/g, '_');
  return `STATERA_Rapport_${safeName}_${new Date().toISOString().split('T')[0]}.jpg`;
}

/** Render the report to a JPG blob. */
export async function generateReportJPG(report: ProgressReport): Promise<Blob> {
  const scale = 2;
  const W = 800 * scale;
  // Height grows with the number of module rows so nothing gets clipped.
  const baseH = 430;
  const rowsH = report.moduleDetails.length * 26;
  const badgeRows = Math.max(1, Math.ceil(report.badges.length / 3));
  const H = (baseH + rowsH + badgeRows * 32) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  drawReport(ctx, W, H, report, scale);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) { resolve(blob); return; }
        // Fallback for browsers where toBlob yields null
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          fetch(dataUrl).then(r => r.blob()).then(resolve).catch(reject);
        } catch (err) {
          reject(err);
        }
      },
      'image/jpeg',
      0.95,
    );
  });
}

/** Trigger a browser download of the given blob. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Open a new window with step-by-step instructions for emailing the
 * downloaded JPG report to the RSSI, including a preview of the image and
 * a pre-filled mailto link.
 */
export function openSendInstructions(
  report: ProgressReport,
  jpgDataUrl: string,
  fileName: string,
): boolean {
  const subject = `[STATERA_Academy] Rapport de progression — ${report.userName} — ${new Date().toLocaleDateString('fr-FR')}`;
  const body = [
    `Bonjour,`,
    ``,
    `Veuillez trouver ci-joint mon rapport de progression de la formation STATERA_Academy (sensibilisation aux risques cyber).`,
    ``,
    `Collaborateur : ${report.userName}`,
    `Grade : Nv.${report.level.level} — ${report.level.title}`,
    `Missions complétées : ${report.completedModules}/${report.totalModules}`,
    `Score moyen : ${report.avgScore}%`,
    `XP total : ${report.totalXP}`,
    ``,
    `/!\\ N'oubliez pas de joindre le fichier "${fileName}" à cet email.`,
    ``,
    `Cordialement,`,
    report.userName,
  ].join('\n');

  const mailto = `mailto:${RSSI_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const win = window.open('', '_blank');
  if (!win) return false;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Envoyer mon rapport au RSSI — STATERA_Academy</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 32px 20px 60px;
    background: #0a0a0f;
    color: #e2e8f0;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    background-image:
      linear-gradient(rgba(0,240,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,240,255,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  h1 { font-size: 20px; color: #00f0ff; letter-spacing: 3px; margin: 0 0 6px;
       text-shadow: 0 0 14px rgba(0,240,255,.4); }
  h1 span { color: #64748b; }
  .sub { font-size: 11px; color: #64748b; letter-spacing: 2px; margin: 0 0 4px; }
  .rule { height: 1px; margin: 18px 0 26px;
          background: linear-gradient(90deg, transparent, #00f0ff, transparent); }
  .ok { border: 1px solid rgba(0,255,136,.25); background: rgba(0,255,136,.05);
        padding: 12px 16px; font-size: 12px; color: #00ff88; margin-bottom: 26px; }
  ol { padding-left: 0; list-style: none; margin: 0 0 28px; counter-reset: step; }
  li { position: relative; padding: 16px 16px 16px 54px; margin-bottom: 10px;
       border: 1px solid rgba(148,163,184,.18); background: rgba(15,23,42,.5);
       font-size: 13px; line-height: 1.6; counter-increment: step; }
  li::before {
    content: counter(step);
    position: absolute; left: 14px; top: 14px;
    width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(0,240,255,.35); color: #00f0ff;
    font-size: 12px; font-weight: bold;
  }
  .mail { color: #00f0ff; font-weight: bold; word-break: break-all; }
  code { background: #0f172a; border: 1px solid rgba(148,163,184,.2);
         padding: 2px 7px; font-size: 12px; color: #f59e0b; word-break: break-all; }
  .btns { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 30px; }
  button, a.btn {
    font-family: inherit; font-size: 12px; letter-spacing: 1.5px; font-weight: bold;
    padding: 13px 22px; cursor: pointer; text-decoration: none;
    border: 1px solid rgba(0,240,255,.35); background: rgba(0,240,255,.07); color: #00f0ff;
    transition: background .15s, border-color .15s;
  }
  button:hover, a.btn:hover { background: rgba(0,240,255,.16); border-color: rgba(0,240,255,.6); }
  a.btn.primary { background: linear-gradient(135deg,#00f0ff,#00ff88); color: #0a0a0f;
                  border-color: transparent; box-shadow: 0 0 22px rgba(0,240,255,.25); }
  .secondary { border-color: rgba(148,163,184,.3) !important;
               background: rgba(148,163,184,.06) !important; color: #94a3b8 !important; }
  h2 { font-size: 11px; color: #00f0ff; letter-spacing: 2px; margin: 30px 0 10px;
       border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
  pre { background: #0f172a; border: 1px solid rgba(148,163,184,.18); padding: 14px;
        font-size: 11.5px; line-height: 1.65; color: #cbd5e1; white-space: pre-wrap;
        word-break: break-word; margin: 0 0 14px; }
  .preview { border: 1px solid rgba(0,240,255,.2); margin-top: 8px; }
  .preview img { display: block; width: 100%; height: auto; }
  .note { font-size: 11px; color: #64748b; line-height: 1.6; margin-top: 8px; }
  .toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
           background: #0f172a; border: 1px solid rgba(0,255,136,.4); color: #00ff88;
           padding: 11px 20px; font-size: 12px; opacity: 0; pointer-events: none;
           transition: opacity .25s; }
  .toast.show { opacity: 1; }
</style>
</head>
<body>
<div class="wrap">
  <h1>STATERA<span>_Academy</span></h1>
  <p class="sub">TRANSMISSION DU RAPPORT AU RSSI</p>
  <div class="rule"></div>

  <div class="ok">&#10003; Votre rapport a été généré et téléchargé au format JPG&nbsp;: <strong>${escapeHtml(fileName)}</strong></div>

  <ol>
    <li>Vérifiez que le fichier <code>${escapeHtml(fileName)}</code> se trouve bien dans votre dossier <strong>Téléchargements</strong>.</li>
    <li>Cliquez sur <strong>OUVRIR MON EMAIL</strong> ci-dessous&nbsp;: un nouveau message pré-rempli s'ouvre, adressé à <span class="mail">${escapeHtml(RSSI_EMAIL)}</span>.</li>
    <li><strong>Joignez le fichier JPG</strong> à l'email (glissez-déposez le fichier dans le message, ou utilisez le bouton trombone / «&nbsp;Joindre un fichier&nbsp;»).</li>
    <li>Envoyez l'email. Votre formation est alors attestée auprès du RSSI.</li>
  </ol>

  <div class="btns">
    <a class="btn primary" href="${mailto}">&#9993; OUVRIR MON EMAIL</a>
    <button class="secondary" onclick="copyAddr()">COPIER L'ADRESSE</button>
    <button class="secondary" onclick="copyBody()">COPIER LE MESSAGE</button>
    <a class="btn secondary" href="${jpgDataUrl}" download="${escapeHtml(fileName)}">RETÉLÉCHARGER LE JPG</a>
  </div>

  <p class="note">Si votre messagerie est une webmail (Gmail, Outlook.com…), le bouton ci-dessus peut ne pas fonctionner&nbsp;: copiez alors l'adresse et le message, puis composez l'email directement dans votre navigateur sans oublier la pièce jointe.</p>

  <h2>OBJET DE L'EMAIL</h2>
  <pre id="subj">${escapeHtml(subject)}</pre>

  <h2>CORPS DU MESSAGE</h2>
  <pre id="body">${escapeHtml(body)}</pre>

  <h2>APERÇU DU RAPPORT</h2>
  <div class="preview"><img src="${jpgDataUrl}" alt="Aperçu du rapport de progression"></div>
</div>

<div class="toast" id="toast"></div>

<script>
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function copy(text, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(msg); },
        function () { toast('Copie impossible — sélectionnez le texte manuellement'); });
    } else {
      toast('Copie impossible — sélectionnez le texte manuellement');
    }
  }
  function copyAddr() { copy(${JSON.stringify(RSSI_EMAIL)}, 'Adresse copiée'); }
  function copyBody() { copy(document.getElementById('body').textContent, 'Message copié'); }
</script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}

/**
 * Full flow: render the report to JPG, download it, then open the
 * instructions window. Returns false if the popup was blocked.
 */
export async function exportReportAndShowInstructions(report: ProgressReport): Promise<{ popupBlocked: boolean }> {
  const blob = await generateReportJPG(report);
  const fileName = buildReportFileName(report);

  downloadBlob(blob, fileName);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  const opened = openSendInstructions(report, dataUrl, fileName);
  return { popupBlocked: !opened };
}
