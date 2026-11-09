// Run with: node src/lib/EmailParser.test.mjs
import assert from "node:assert/strict"
import { parse_email } from "./EmailParser.ts"

const eml = [
	`From: =?UTF-8?B?SsO8cmdlbg==?= <j@example.com>`,
	`Subject: =?ISO-8859-1?Q?Caf=E9?=`,
	` =?UTF-8?Q?_=E2=82=AC5?=`,
	`Content-Type: multipart/mixed; boundary="outer"`,
	``,
	`preamble`,
	`--outer`,
	`Content-Type: multipart/alternative; boundary=inner`,
	``,
	`--inner`,
	`Content-Type: text/plain; charset=iso-8859-1`,
	`Content-Transfer-Encoding: quoted-printable`,
	``,
	`na=EFve soft=`,
	` break`,
	`--inner`,
	`Content-Type: text/html; charset="utf-8"`,
	`Content-Transfer-Encoding: base64`,
	``,
	btoa(`<img src="cid:logo">`),
	`--inner--`,
	`--outer`,
	`Content-Type: image/png; name="=?UTF-8?B?bMO2Z28ucG5n?="`,
	`Content-ID: <logo>`,
	`Content-Transfer-Encoding: base64`,
	``,
	btoa("\x89PNG"),
	`--outer`,
	`Content-Type: text/plain`,
	`Content-Disposition: attachment;`,
	` filename*=utf-8''n%C3%B6tes%20.txt`,
	``,
	`attached`,
	`--outer--`,
	`epilogue`,
].join("\r\n")

const mail = parse_email(Uint8Array.from(eml, c => c.charCodeAt(0)))

assert.equal(mail.headers.from, "Jürgen <j@example.com>")
assert.equal(mail.headers.subject, "Café €5")
assert.equal(mail.text, "naïve soft break")
assert.equal(mail.html, `<img src="data:image/png;base64,${btoa("\x89PNG")}">`)
assert.deepEqual(mail.attachments.map(a => [a.name, a.data]), [
	["lögo.png", "\x89PNG"],
	["nötes .txt", "attached"],
])

// A message without MIME headers is a plain text email
assert.equal(parse_email(new TextEncoder().encode("Subject: hi\n\nbödy")).text, "bödy")
