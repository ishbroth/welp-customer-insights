import { emailUrls } from '../utils/emailConfig.ts';

export interface BaseEmailProps {
  title: string;
  previewText: string;
  content: string;
  footerText?: string;
}

export function createBaseEmail(p: BaseEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{margin:0;padding:0;font-family:-apple-system,sans-serif;color:#374151;background:#f9fafb}
    .container{max-width:600px;margin:0 auto;background:#fff}
    .header{background:#3b82f6;padding:24px;text-align:center}
    .header h1{margin:0;color:#fff;font-size:24px}
    .content{padding:32px 24px}
    .button{display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0}
    .footer{padding:24px;text-align:center;color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb}
    .footer a{color:#3b82f6;text-decoration:none}
  </style>
</head>
<body>
  <div style="display:none">${p.previewText}</div>
  <div class="container">
    <div class="header"><h1>Welp!</h1></div>
    <div class="content">${p.content}</div>
    <div class="footer">
      ${p.footerText || 'Thank you for using Welp!'}<br><br>
      <a href="${emailUrls.support}">Support</a> | <a href="${emailUrls.app}">Visit Welp</a>
    </div>
  </div>
</body>
</html>`;
}
