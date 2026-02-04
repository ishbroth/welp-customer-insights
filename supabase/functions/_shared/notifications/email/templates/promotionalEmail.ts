import { createBaseEmail } from "./base.ts";

export interface PromotionalEmailProps {
  businessName: string;
  emailContent: string;
  imageUrls?: string[];
  unsubscribeUrl?: string;
}

export function createPromotionalEmail(p: PromotionalEmailProps): string {
  const imagesHtml = (p.imageUrls || [])
    .slice(0, 3)
    .map(url =>
      '<div style="margin:16px 0;text-align:center">' +
      '<img src="' + url + '" alt="Promotion image" style="max-width:100%;height:auto;border-radius:8px" />' +
      "</div>"
    )
    .join("");

  const unsubLink = p.unsubscribeUrl
    ? '<br><a href="' + p.unsubscribeUrl + '" style="color:#3b82f6">Manage your notification preferences</a>'
    : "";

  const content =
    '<h2 style="color:#1f2937;margin-bottom:8px">Special Promotion from ' + p.businessName + "</h2>" +
    '<div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:16px 0">' +
    '<p style="white-space:pre-wrap;margin:0;color:#374151;line-height:1.6">' + p.emailContent + "</p>" +
    "</div>" +
    imagesHtml +
    '<p style="color:#6b7280;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">' +
    "This promotional email was sent through Yitch on behalf of " + p.businessName + ". " +
    "Your email address was not shared with this business." +
    unsubLink +
    "</p>";

  return createBaseEmail({
    title: "Promotion from " + p.businessName,
    previewText: "Special promotion from " + p.businessName,
    content,
    footerText: "You received this email because you have promotional emails enabled on Yitch.",
  });
}
