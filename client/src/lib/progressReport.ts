// ============================================================
// Design: Neon Terminal / Cyberpunk
// Utility: Generate progress report & email to RSSI
// ============================================================

import { type UserProgress, MODULES, BADGES, getLevel, LEVELS } from './moduleData';

const RSSI_EMAIL = 'rssi@statera-corp.com';

export interface ProgressReport {
  userName: string;
  date: string;
  level: { level: number; title: string; color: string };
  totalXP: number;
  completedModules: number;
  totalModules: number;
  avgScore: number;
  badges: string[];
  moduleDetails: { name: string; score: number | null; completed: boolean }[];
}

export function generateReport(progress: UserProgress, userName: string): ProgressReport {
  const level = getLevel(progress.totalXP);
  const completedCount = progress.completedModules.length;
  const avgScore = completedCount > 0
    ? Math.round(Object.values(progress.moduleScores).reduce((a, b) => a + b, 0) / completedCount)
    : 0;

  const earnedBadges = BADGES
    .filter(b => progress.badges.includes(b.id))
    .map(b => `${b.icon} ${b.title}`);

  const moduleDetails = MODULES.map(mod => ({
    name: mod.title,
    score: progress.moduleScores[mod.id] ?? null,
    completed: progress.completedModules.includes(mod.id),
  }));

  return {
    userName,
    date: new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    level,
    totalXP: progress.totalXP,
    completedModules: completedCount,
    totalModules: MODULES.length,
    avgScore,
    badges: earnedBadges,
    moduleDetails,
  };
}

export function formatReportText(report: ProgressReport): string {
  const separator = '═'.repeat(50);
  const thinSep = '─'.repeat(50);

  let text = `${separator}\n`;
  text += `  STATERA_Academy — Rapport de Progression\n`;
  text += `${separator}\n\n`;
  text += `Collaborateur : ${report.userName}\n`;
  text += `Date du rapport : ${report.date}\n`;
  text += `${thinSep}\n\n`;

  text += `NIVEAU & XP\n`;
  text += `  Grade actuel : Nv.${report.level.level} — ${report.level.title}\n`;
  text += `  XP total : ${report.totalXP} XP\n\n`;

  text += `PROGRESSION DES MISSIONS\n`;
  text += `  Modules complétés : ${report.completedModules}/${report.totalModules}\n`;
  text += `  Score moyen : ${report.avgScore}%\n\n`;

  text += `DÉTAIL PAR MODULE\n`;
  report.moduleDetails.forEach(mod => {
    const status = mod.completed ? '[OK]' : '[  ]';
    const score = mod.score !== null ? `${mod.score}%` : 'Non commencé';
    text += `  ${status} ${mod.name} — ${score}\n`;
  });

  text += `\n`;

  if (report.badges.length > 0) {
    text += `BADGES OBTENUS (${report.badges.length})\n`;
    report.badges.forEach(b => {
      text += `  ${b}\n`;
    });
  } else {
    text += `BADGES : Aucun badge obtenu pour le moment\n`;
  }

  text += `\n${separator}\n`;
  text += `  Généré par STATERA_Academy — Formation Cybersécurité 2026\n`;
  text += `${separator}\n`;

  return text;
}

export function formatReportHTML(report: ProgressReport): string {
  const moduleRows = report.moduleDetails.map(mod => {
    const status = mod.completed
      ? '<span style="color:#00ff88;font-weight:bold;">&#10003;</span>'
      : '<span style="color:#64748b;">&#8212;</span>';
    const score = mod.score !== null ? `${mod.score}%` : 'Non commencé';
    const scoreColor = mod.score !== null
      ? (mod.score >= 80 ? '#00ff88' : mod.score >= 50 ? '#f59e0b' : '#ff0066')
      : '#64748b';
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">${status}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;color:#e2e8f0;">${mod.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e293b;text-align:center;color:${scoreColor};font-weight:bold;">${score}</td>
    </tr>`;
  }).join('');

  const badgesList = report.badges.length > 0
    ? report.badges.map(b => `<span style="display:inline-block;padding:4px 12px;margin:4px;background:#0f172a;border:1px solid #00f0ff30;color:#e2e8f0;font-size:13px;">${b}</span>`).join('')
    : '<span style="color:#64748b;">Aucun badge obtenu pour le moment</span>';

  return `
<div style="max-width:600px;margin:0 auto;background:#0a0a0f;color:#e2e8f0;font-family:'Courier New',monospace;padding:0;">
  <div style="background:linear-gradient(135deg,#0a0a0f 0%,#0f172a 100%);padding:30px;border-bottom:2px solid #00f0ff;">
    <h1 style="margin:0;font-size:20px;color:#00f0ff;letter-spacing:3px;">STATERA<span style="color:#64748b;">_Academy</span></h1>
    <p style="margin:8px 0 0;font-size:12px;color:#64748b;letter-spacing:2px;">RAPPORT DE PROGRESSION</p>
  </div>

  <div style="padding:24px 30px;">
    <table style="width:100%;margin-bottom:20px;">
      <tr>
        <td style="color:#64748b;font-size:12px;padding:4px 0;">Collaborateur</td>
        <td style="color:#e2e8f0;font-weight:bold;font-size:14px;padding:4px 0;">${report.userName}</td>
      </tr>
      <tr>
        <td style="color:#64748b;font-size:12px;padding:4px 0;">Date</td>
        <td style="color:#e2e8f0;font-size:13px;padding:4px 0;">${report.date}</td>
      </tr>
    </table>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <div style="flex:1;background:#0f172a;border:1px solid #00f0ff30;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:bold;color:#00f0ff;">${report.level.level}</div>
        <div style="font-size:11px;color:#64748b;letter-spacing:1px;">${report.level.title}</div>
      </div>
      <div style="flex:1;background:#0f172a;border:1px solid #00ff8830;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:bold;color:#00ff88;">${report.totalXP}</div>
        <div style="font-size:11px;color:#64748b;letter-spacing:1px;">XP TOTAL</div>
      </div>
      <div style="flex:1;background:#0f172a;border:1px solid #f59e0b30;padding:16px;text-align:center;">
        <div style="font-size:24px;font-weight:bold;color:#f59e0b;">${report.avgScore}%</div>
        <div style="font-size:11px;color:#64748b;letter-spacing:1px;">SCORE MOYEN</div>
      </div>
    </div>

    <h2 style="font-size:12px;color:#00f0ff;letter-spacing:2px;margin:24px 0 12px;border-bottom:1px solid #1e293b;padding-bottom:8px;">MISSIONS (${report.completedModules}/${report.totalModules})</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${moduleRows}
    </table>

    <h2 style="font-size:12px;color:#00f0ff;letter-spacing:2px;margin:24px 0 12px;border-bottom:1px solid #1e293b;padding-bottom:8px;">BADGES</h2>
    <div style="margin-bottom:20px;">${badgesList}</div>
  </div>

  <div style="background:#0f172a;padding:16px 30px;border-top:1px solid #1e293b;text-align:center;">
    <p style="margin:0;font-size:11px;color:#64748b;letter-spacing:1px;">STATERA_Academy — Formation Cybersécurité 2026</p>
  </div>
</div>`;
}

export function generateMailtoLink(report: ProgressReport): string {
  const subject = encodeURIComponent(
    `[STATERA_Academy] Rapport de progression — ${report.userName} — ${new Date().toLocaleDateString('fr-FR')}`
  );
  const body = encodeURIComponent(formatReportText(report));
  return `mailto:${RSSI_EMAIL}?subject=${subject}&body=${body}`;
}

export function downloadReport(report: ProgressReport): void {
  const text = formatReportText(report);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STATERA_Rapport_${report.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadReportHTML(report: ProgressReport): void {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Rapport STATERA_Academy — ${report.userName}</title></head><body style="margin:0;padding:20px;background:#0a0a0f;">${formatReportHTML(report)}</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STATERA_Rapport_${report.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
