export type Email = {
	headers: { [name: string]: string },
	text: string,
	html: string,
	// The data is a binary string, one character per byte
	attachments: { name: string, type: string, cid: string, data: string }[],
}

const decode = (bin: string, charset: string) => {
	const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
	try {
		return new TextDecoder(charset || "utf-8").decode(bytes)
	} catch {
		// TextDecoder throws on charsets the browser does not know
		return new TextDecoder().decode(bytes)
	}
}

const quoted_printable = (s: string) => s.replace(/=\n/g, "").replace(
	/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)),
)

// RFC 2047 encoded words: =?charset?b|q?text?=. Whitespace between two encoded
// words is not part of the text
const decode_words = (s: string) => s.replace(/\?=\s+=\?/g, "?==?").replace(
	/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi,
	(_, charset, enc, text) => decode(
		enc.toLowerCase() === "b" ?
			atob(text) : quoted_printable(text.replace(/_/g, " ")),
		charset,
	),
)

// ponytail: RFC 2231 continuations (filename*0*=...) are not supported. Clients
// which split long names like that usually also send a name in the Content-Type
const param = (header: string, name: string) => {
	const m = new RegExp(`;\\s*${name}="?([^";]*)`, "i").exec(header)
	if (m) {
		return m[1].trim()
	}

	// RFC 2231 extended form: name*=charset'language'percent-encoded. This is
	// quoted-printable with a different escape character
	const ext = new RegExp(`;\\s*${name}\\*=([^']*)'[^']*'([^;\\s]*)`, "i").exec(header)
	return ext ? decode(quoted_printable(ext[2].replace(/%/g, "=")), ext[1]) : ""
}

const parse_part = (raw: string, mail: Email) => {
	// The headers run up to the first empty line, the rest is the body
	const [, head, body] = /^((?:.+\n)*)\n?([^]*)$/.exec(raw)

	const h: { [name: string]: string } = {}
	for (const line of decode(head, "utf-8").replace(/\n[ \t]+/g, " ").split("\n")) {
		const i = line.indexOf(":")
		h[line.slice(0, i).toLowerCase()] = line.slice(i + 1).trim()
	}

	const type = h["content-type"] || "text/plain"
	const mime = type.split(";")[0].trim().toLowerCase()
	const disposition = h["content-disposition"] || ""
	const name = decode_words(param(disposition, "filename") || param(type, "name"))
	const encoding = (h["content-transfer-encoding"] || "").toLowerCase()

	if (mime.startsWith("multipart/")) {
		const parts = ("\n" + body).split("\n--" + param(type, "boundary"))
		for (const part of parts.slice(1)) {
			// The closing delimiter has two more dashes after the boundary
			if (!part.startsWith("--")) {
				parse_part(part.slice(part.indexOf("\n") + 1), mail)
			}
		}
		return h
	}

	const data = encoding === "base64" ? atob(body) :
		encoding === "quoted-printable" ? quoted_printable(body) : body

	if (
		name === "" && !/^attachment/i.test(disposition) &&
		(mime === "text/plain" || mime === "text/html")
	) {
		mail[mime === "text/html" ? "html" : "text"] += decode(data, param(type, "charset"))
	} else {
		mail.attachments.push({
			name: name || mime,
			type: mime,
			cid: (h["content-id"] || "").replace(/[<>]/g, ""),
			data: data,
		})
	}
	return h
}

export const parse_email = (bytes: Uint8Array): Email => {
	// The charset of each part is only known after parsing its headers, so we
	// parse the structure as a binary string and decode the text afterwards
	let bin = ""
	for (let i = 0; i < bytes.length; i += 8192) {
		bin += String.fromCharCode(...bytes.subarray(i, i + 8192))
	}

	const mail: Email = { headers: {}, text: "", html: "", attachments: [] }
	mail.headers = parse_part(bin.replace(/\r\n/g, "\n"), mail)

	for (const name in mail.headers) {
		mail.headers[name] = decode_words(mail.headers[name])
	}

	// Inline images are attachments which the HTML refers to by content ID
	for (const a of mail.attachments) {
		if (a.cid !== "" && mail.html.includes("cid:" + a.cid)) {
			mail.html = mail.html.split("cid:" + a.cid).join(
				"data:" + a.type + ";base64," + btoa(a.data),
			)
		}
	}
	return mail
}
