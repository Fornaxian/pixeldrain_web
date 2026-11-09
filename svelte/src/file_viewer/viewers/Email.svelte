<script lang="ts">
import { parse_email, type Email } from "lib/EmailParser";
import { formatDataVolume } from "util/Formatting";

let { src = "", children }: {
	src?: string;
	children?: import('svelte').Snippet;
} = $props();

let mail: Email = $state(null)
let error = $state("")

$effect(() => { load(src) })
const load = async (src: string) => {
	mail = null
	error = ""
	try {
		const resp = await fetch(src)
		if (!resp.ok) {
			throw resp.status
		}
		mail = parse_email(new Uint8Array(await resp.arrayBuffer()))
	} catch (err) {
		console.error(err)
		error = "Error loading email: " + err
	}
}

// The email body is untrusted. The sandbox on the iframe disables scripts and
// forms and gives the document its own origin. This policy blocks all remote
// content, because loading it would tell the sender who opened the email
const head = `<!DOCTYPE html><meta http-equiv="Content-Security-Policy" ` +
	`content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">` +
	`<base target="_blank">`

// The type must be octet-stream, otherwise an HTML attachment which is opened
// in a new tab would run scripts on our own origin
const attachment_url = (data: string) => URL.createObjectURL(new Blob(
	[Uint8Array.from(data, c => c.charCodeAt(0))],
	{ type: "application/octet-stream" },
))
</script>

<div class="container">
	{@render children?.()}

	{#if mail !== null}
		<div class="headers">
			<h2>{mail.headers.subject || ""}</h2>
			{#each ["From", "To", "Cc", "Date"] as name}
				{#if mail.headers[name.toLowerCase()]}
					{name}: {mail.headers[name.toLowerCase()]}<br/>
				{/if}
			{/each}
			{#each mail.attachments as a}
				<a
					href="#attachment"
					download={a.name}
					onclick={e => e.currentTarget.href = attachment_url(a.data)}
				>
					<i class="icon">attachment</i>
					{a.name} ({formatDataVolume(a.data.length, 3)})
				</a><br/>
			{/each}
		</div>

		{#if mail.html !== ""}
			<iframe
				title="Email body"
				sandbox="allow-popups allow-popups-to-escape-sandbox"
				srcdoc={head + mail.html}
			></iframe>
		{:else}
			<pre>{mail.text}</pre>
		{/if}
	{:else}
		<p>{error || "Loading..."}</p>
	{/if}
</div>

<style>
.container {
	display: flex;
	flex-direction: column;
	background: var(--body_color);
	text-align: left;
	height: 100%;
	width: 100%;
	overflow-y: auto;
}
.headers, p, pre {
	margin: 0;
	padding: 10px;
}
pre {
	white-space: pre-wrap;
	border: none;
	word-break: break-word;
}
iframe {
	flex: 1 0 60%;
	border: none;
	/* Emails are designed for a white page and rarely set a background */
	background: #ffffff;
}
</style>
