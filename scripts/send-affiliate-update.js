// One-time broadcast: thank-you + fix & flip tips + apply form update.
// Sends directly via Resend. Requires RESEND_API_KEY env var.
// Run with: node scripts/send-affiliate-update.js
//
// Set your key before running (PowerShell):
//   $env:RESEND_API_KEY = "re_xxxxxxxxxxxx"

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY environment variable is not set.');
  console.error('Run: $env:RESEND_API_KEY = "your-key-here"');
  process.exit(1);
}

const affiliates = [
  { name: 'Esther Denison',   email: 'estherden44@gmail.com'       },
  { name: 'Doretha Dennis',   email: 'ahomeforlivingllc@gmail.com' },
  { name: 'Sunil Kumria',     email: 'skumria@gmail.com'           },
  { name: 'Chris Diamond',    email: 'Diamond.chris@ymail.com'     },
  { name: 'Daxton Rogers',    email: 'Rogersdaxton@gmail.com'      },
];

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getFirstName(name) {
  return name.split(' ')[0];
}

function buildAffiliateLink(name) {
  return `https://sgcapital.io/?ref=${slugify(name)}`;
}

async function sendEmail(affiliate) {
  const firstName     = getFirstName(affiliate.name);
  const affiliateLink = buildAffiliateLink(affiliate.name);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Edgar Vargas — Southern Ground Capital <edgar@sgcapital.io>',
      to:      [affiliate.email],
      bcc:     ['edgar@sgcapital.io'],
      subject: `A Quick Thank-You + Tips to Land Your First Referral Fee`,
      html:    buildEmail(firstName, affiliateLink),
    }),
  });

  if (res.ok) {
    console.log(`✓  ${affiliate.name} <${affiliate.email}>`);
  } else {
    const err = await res.text();
    console.error(`✗  ${affiliate.name} — ${res.status}: ${err}`);
  }
}

function buildEmail(firstName, affiliateLink) {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Georgia,serif">
  <div style="max-width:620px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:#101e14;padding:32px 40px">
      <h1 style="margin:0;color:#c8923a;font-size:22px;letter-spacing:1px;font-family:Georgia,serif">SOUTHERN GROUND CAPITAL</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;font-family:Arial,sans-serif">Hard Money Lending &nbsp;&middot;&nbsp; Private Capital</p>
    </div>

    <!-- Body -->
    <div style="padding:40px">

      <h2 style="margin:0 0 20px;color:#101e14;font-size:24px;font-family:Georgia,serif">Hey ${firstName},</h2>

      <p style="color:#444;font-size:15px;line-height:1.8;margin:0 0 18px">
        I just wanted to take a moment to say <strong>thank you</strong> for being part of the Southern Ground Capital affiliate network.
        Partnering with people who are out there in the field — in the meetings, the group chats, the DMs — is how we actually reach
        investors who need us. I genuinely appreciate your trust in bringing my company into your circle.
      </p>

      <p style="color:#444;font-size:15px;line-height:1.8;margin:0 0 28px">
        Your unique referral link is below. Every investor who applies through it is tagged to you — so when the deal closes,
        you get paid. No exceptions, no games.
      </p>

      <!-- Link box -->
      <div style="background:#f9f6f0;border-left:4px solid #c8923a;padding:20px 24px;margin:0 0 36px;border-radius:0 6px 6px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#101e14;font-size:12px;text-transform:uppercase;letter-spacing:.5px;font-family:Arial,sans-serif">Your Affiliate Link</p>
        <p style="margin:0 0 14px;font-family:monospace;font-size:16px;color:#c8923a;word-break:break-all">${affiliateLink}</p>
        <a href="${affiliateLink}" style="background:#c8923a;color:#fff;text-decoration:none;padding:10px 22px;border-radius:5px;font-size:13px;font-weight:bold;font-family:Arial,sans-serif;display:inline-block">Share Your Link &rarr;</a>
      </div>

      <!-- Apply form update -->
      <div style="background:#f0f6f2;border:1px solid #c3d9c8;border-radius:8px;padding:24px 28px;margin:0 0 36px">
        <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#2a6645;font-family:Arial,sans-serif">&#x1F4CB; &nbsp;Update — New Application Process</p>
        <p style="margin:0 0 12px;color:#1C3D26;font-size:15px;line-height:1.7">
          We just upgraded how investors submit deals. Instead of a quick contact form, they now complete a
          <strong>5-step application</strong> that captures every detail we need to make a lending decision — property info,
          loan structure, borrower profile, and entity details.
        </p>
        <p style="margin:0 0 12px;color:#1C3D26;font-size:15px;line-height:1.7">
          <strong>What this means for you:</strong> investors who come through your link and complete the form are
          <em>serious</em> leads. We respond to full applications faster, issue term sheets faster, and close faster —
          which means you see your referral fee sooner.
        </p>
        <p style="margin:0;color:#1C3D26;font-size:15px;line-height:1.7">
          When you refer someone, just tell them: <em>"Go to my link and fill out the 5-minute application — they respond same day."</em>
        </p>
      </div>

      <!-- Tips section -->
      <h3 style="color:#101e14;font-size:19px;margin:0 0 14px;font-family:Georgia,serif">How to Earn a Fix &amp; Flip Investor's Business</h3>
      <p style="color:#444;font-size:15px;line-height:1.8;margin:0 0 18px">
        Fix and flip investors are loyal — once they find a lender who delivers, they stick with them and send everyone they know.
        Here's how to become the person who makes that introduction:
      </p>

      <table style="border-collapse:collapse;width:100%;margin-bottom:28px">
        <tr>
          <td style="padding:12px 16px 12px 0;vertical-align:top;width:28px">
            <div style="background:#c8923a;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif">1</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ece6;vertical-align:top">
            <strong style="color:#101e14;font-size:14px">Know the pain point cold</strong>
            <p style="margin:4px 0 0;color:#555;font-size:14px;line-height:1.7">
              Fix and flip investors hate two things: deals falling apart because funding fell through, and lenders who take 3 weeks to say no.
              Lead with: <em>"I know a private lender who gives a term sheet in 24 hours with no credit pull and no upfront fees."</em>
              That sentence opens doors.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px 12px 0;vertical-align:top">
            <div style="background:#c8923a;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif">2</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ece6;vertical-align:top">
            <strong style="color:#101e14;font-size:14px">Put your link in your email signature</strong>
            <p style="margin:4px 0 0;color:#555;font-size:14px;line-height:1.7">
              Every email you send is a chance. Add something like: <em>"Need fast real estate capital? Apply here: [your link]."</em>
              Passive exposure turns into referrals you didn't even know were coming.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px 12px 0;vertical-align:top">
            <div style="background:#c8923a;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif">3</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ece6;vertical-align:top">
            <strong style="color:#101e14;font-size:14px">Partner with wholesalers</strong>
            <p style="margin:4px 0 0;color:#555;font-size:14px;line-height:1.7">
              Wholesalers constantly work with investors who need funding fast. If you know wholesalers in your market,
              tell them you can get their buyers funded. They'll send you deal after deal.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px 12px 0;vertical-align:top">
            <div style="background:#c8923a;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif">4</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ece6;vertical-align:top">
            <strong style="color:#101e14;font-size:14px">Show up at local REI meetups</strong>
            <p style="margin:4px 0 0;color:#555;font-size:14px;line-height:1.7">
              Real estate investor clubs are the highest-density room of your target audience. Introduce yourself as
              someone who connects investors with private capital. You don't need to be an expert — you just need the right contact.
              <a href="${affiliateLink}" style="color:#c8923a">That's your link.</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px 12px 0;vertical-align:top">
            <div style="background:#c8923a;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif">5</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0ece6;vertical-align:top">
            <strong style="color:#101e14;font-size:14px">Post on social media</strong>
            <p style="margin:4px 0 0;color:#555;font-size:14px;line-height:1.7">
              LinkedIn, Instagram, and Facebook REI groups all have active investors looking for capital. A simple post —
              <em>"Are slow lenders killing your deals? I know a private lender who moves in 24 hours. DM me or use my link."</em>
              — can generate real interest with zero ad spend.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px 12px 0;vertical-align:top">
            <div style="background:#c8923a;color:#fff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:bold;font-family:Arial,sans-serif">6</div>
          </td>
          <td style="padding:12px 0;vertical-align:top">
            <strong style="color:#101e14;font-size:14px">Set the expectation right</strong>
            <p style="margin:4px 0 0;color:#555;font-size:14px;line-height:1.7">
              Tell the investor to fill out the full application — not just a name and email. The more detail they give,
              the faster we can move. A complete application = same-day response. That's the story you tell.
            </p>
          </td>
        </tr>
      </table>

      <p style="color:#444;font-size:15px;line-height:1.8;margin:0 0 32px">
        You don't need to sell anything. You just need to connect the right people. I'll handle everything after that — the underwriting,
        the term sheet, the closing. Your job is the introduction.
      </p>

      <p style="color:#444;font-size:15px;line-height:1.8;margin:0">
        Thank you again for being part of this. I'm looking forward to closing deals together.
      </p>

      <p style="color:#444;font-size:15px;margin:24px 0 0;line-height:1.5">
        With gratitude,<br/>
        <strong style="color:#101e14;font-size:16px">Edgar Vargas</strong><br/>
        <span style="color:#888;font-size:13px;font-family:Arial,sans-serif">Southern Ground Capital</span><br/>
        <a href="tel:+16788428084" style="color:#c8923a;font-size:13px;font-family:Arial,sans-serif">(678) 842-8084</a>
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#f5f5f0;padding:20px 40px;border-top:1px solid #e8e4de">
      <p style="margin:0;color:#999;font-size:12px;text-align:center;font-family:Arial,sans-serif">
        &copy; ${year} Southern Ground Capital, LLC &nbsp;&middot;&nbsp; Investment loans only, not consumer lending<br/>
        You're receiving this because you registered as a Southern Ground Capital affiliate.
      </p>
    </div>

  </div>
</body>
</html>`;
}

(async function () {
  console.log(`\nSending affiliate update to ${affiliates.length} contacts...\n`);
  for (const affiliate of affiliates) {
    await sendEmail(affiliate);
    await new Promise(r => setTimeout(r, 800));
  }
  console.log('\n✓ Done. Check your BCC inbox for copies.');
})();
