/**
 * Xperience Studios — project form receiver.
 * Paste into Extensions → Apps Script of the "Project briefs" Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Access: Anyone).
 * Each submission: appends a row to the sheet + emails NOTIFY_EMAIL.
 */
const NOTIFY_EMAIL = 'hello@xperiencestudios.com,bharathuxdesigner@gmail.com';
const HEADERS = ['Received', 'First name', 'Last name', 'Email', 'Phone', 'Budget', 'Timeline', 'Project', 'Links', 'Page'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.website) return json({ ok: true }); // honeypot: bots fill the hidden field

    const clean = (v, max) => String(v || '').trim().slice(0, max || 500);
    const row = {
      first: clean(d.first, 100), last: clean(d.last, 100), email: clean(d.email, 200),
      phone: clean(d.phone, 50), budget: clean(d.budget, 50), timeline: clean(d.timeline, 50),
      project: clean(d.project, 5000), links: clean(d.links, 1000), page: clean(d.page, 300),
    };
    if (!row.first || !row.last || !/\S+@\S+\.\S+/.test(row.email) || !row.project || !row.budget) {
      return json({ ok: false, error: 'missing_fields' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    // Prefix "'" so a value starting with = + - @ is stored as text, not run as a formula.
    const safe = v => /^[=+\-@]/.test(v) ? "'" + v : v;
    sheet.appendRow([new Date(), row.first, row.last, row.email, row.phone, row.budget,
      row.timeline, row.project, row.links, row.page].map(v => v instanceof Date ? v : safe(v)));

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: row.email,
      subject: `Project brief — ${row.first} ${row.last} (${row.budget})`,
      body: [
        `Name: ${row.first} ${row.last}`, `Email: ${row.email}`,
        row.phone && `Phone: ${row.phone}`, `Budget: ${row.budget}`,
        row.timeline && `Timeline: ${row.timeline}`, '', 'Project:', row.project,
        row.links && `\nLinks:\n${row.links}`, '', `Sent from ${row.page}`,
        `All briefs: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`,
      ].filter(Boolean).join('\n'),
    });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
