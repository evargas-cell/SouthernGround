import type { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "loans@sgcapital.io";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@sgcapital.io";

function formatAmount(val: string) {
  const map: Record<string, string> = {
    "under-100k": "Under $100,000",
    "100k-250k": "$100,000 – $250,000",
    "250k-500k": "$250,000 – $500,000",
    "500k-1m": "$500,000 – $1,000,000",
    "over-1m": "Over $1,000,000",
  };
  return map[val] ?? val;
}

function formatPropertyType(val: string) {
  const map: Record<string, string> = {
    sfr: "Single Family Residential",
    multi: "Multi-Family (2–4 units)",
    commercial: "Commercial",
    "mixed-use": "Mixed Use",
    land: "Land / Lot",
  };
  return map[val] ?? val;
}

function buildHtml(data: Record<string, string>, formType: string) {
  const isHero = formType === "hero";
  const isAffiliate = formType === "affiliate";
  const title = isAffiliate
    ? "New Affiliate Application"
    : isHero
    ? "New Quick Quote Request"
    : "New Loan Request";

  const rows = isAffiliate
    ? [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
      ]
    : [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Loan Type", data.loanType],
        ["Loan Amount", formatAmount(data.loanAmount)],
        ...(isHero
          ? [["Property Type", formatPropertyType(data.propertyType)]]
          : [
              ["Property State", data.propertyState],
              ["Message", data.message],
            ]),
      ]
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;font-weight:600;color:#555;white-space:nowrap;vertical-align:top;width:160px;">${label}</td>
        <td style="padding:10px 16px;color:#111;">${value?.replace(/\n/g, "<br/>") ?? ""}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0A1628;padding:28px 32px;">
            <div style="color:#E8A020;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:monospace;margin-bottom:8px;">Southern Ground Capital</div>
            <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">${title}</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tbody>
                ${rows}
              </tbody>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;">
            <div style="color:#999;font-size:11px;">Submitted via sgcapital.io · ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body ?? "{}");
    const { formType = "contact", ...fields } = data;

    if (!fields.name || !fields.email || !fields.phone) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const isHero = formType === "hero";
    const isAffiliate = formType === "affiliate";
    const subject = isAffiliate
      ? `New Affiliate Application — ${fields.name}`
      : isHero
      ? `Quick Quote Request — ${fields.loanType || "Loan"} — ${fields.name}`
      : `Loan Request — ${fields.loanType || "Loan"} — ${fields.name}`;

    await resend.emails.send({
      from: `Southern Ground Capital <${FROM_EMAIL}>`,
      to: TO_EMAIL,
      replyTo: fields.email,
      subject,
      html: buildHtml(fields, formType),
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("send-email error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to send email" }),
    };
  }
};
