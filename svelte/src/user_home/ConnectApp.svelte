<script>
import { onMount } from "svelte";
import Spinner from "../util/Spinner.svelte";
import { copy_text } from "../util/Util.svelte";

let loading = false
let app_name = ""
let api_key = ""

const create_key = async () => {
	loading = true
	try {
		let form = new FormData()
		form.append("app_name", app_name)

		const resp = await fetch(
			window.api_endpoint+"/user/session",
			{
				method: "POST",
				body: form,
			}
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}

		api_key = (await resp.json()).auth_key
	} catch (err) {
		alert("Failed to create new API key! "+err)
	} finally {
		loading = false
	}
}

let copied = false
const copy_key = () => {
	if (copy_text(api_key)) {
		copied = true
	}
}

let show_key = ""
const toggle_show_key = () => {
	if (show_key === "") {
		show_key = api_key
	} else {
		show_key = ""
	}
}

onMount(() => {
	let app = new URL(window.location.href).searchParams.get("app")
	if (app) {
		app_name = app
	}
})
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}
	<div class="limit_width">
		{#if app_name === "jdownloader"}
			<h2>
				Connect
				<img src="/res/img/jdownloader.png" alt="JDownloader logo" class="app_icon_small"/>
				JDownloader to your pixeldrain account
			</h2>
			<p>
				To connect JDownloader to pixeldrain you need to generate an API
				key and enter it in JDownloader's Account Manager.
				<br/>
				<strong>Do not show the generated key to anyone</strong>, it can
				be used to gain access to your pixeldrain account!
			</p>

			{#if !api_key}
				<div class="center">
					<button class="button_highlight" on:click={create_key}>
						<i class="icon">add</i>
						Generate key
					</button>
				</div>
			{:else}
				<h3>Key created</h3>

				<div class="copy_container">
					<button on:click={copy_key} class="copy_button" class:button_highlight={copied}>
						<i class="icon">content_copy</i>
						{#if copied}
							Copied!
						{:else}
							Copy key to clipboard
						{/if}
					</button>
					<button on:click={toggle_show_key} class="copy_button" class:button_highlight={show_key !== ""}>
						<i class="icon">visibility</i>
						{#if show_key === ""}
							Show key
						{/if}
					</button>
					<input bind:value={show_key} class="copy_textarea" type="text" placeholder="Your key will show up here" disabled={show_key === ""}/>
				</div>
			{/if}

			<p>
				Paste the key in JDownloader to authenticate the app.
			</p>
		{:else if app_name === "sharex"}
			<h2>
				Connect
				<img src="/res/img/sharex.png" alt="ShareX logo" class="app_icon_small"/>
				ShareX to your pixeldrain account
			</h2>
			<p>
				ShareX is a Screen capture, file sharing and productivity tool.
				Pixeldrain is supported as a custom uploader. You can <a
				href="https://getsharex.com/" target="_blank">get ShareX
				here</a>.
			</p>
			<p>
				Here you can download our custom ShareX uploader which uses
				pixeldrain to upload your files. This uploader is configured to
				upload files to your personal pixeldrain account. <strong>Do not
				share the configuration file with anyone</strong>, it contains
				your account credentials.
			</p>

			<div class="center">
				<a href="/misc/sharex/pixeldrain.com.sxcu" class="button button_highlight">
					<i class="icon small">save</i>
					Download ShareX Uploader
				</a>
			</div>

			<h3>Setting pixeldrain as default uploader</h3>
			<p>
				Download the uploader config and choose 'Open file'
				<br/>
				<img src="/res/img/sharex_download.png" style="max-width: 100%;" alt=""/><br/>
				Set pixeldrain.com as active uploader. Choose Yes
				<br/>
				<img src="/res/img/sharex_default.png" style="max-width: 100%;" alt=""/><br/>
			</p>
		{:else}
			<h2>Connect an app to your pixeldrain account</h2>
			<ul>
				<li>
					<button on:click={() => {app_name = "jdownloader"}}>
						<img src="/res/img/jdownloader.png" alt="JDownloader logo" class="app_icon"/>
						Connect JDownloader
					</button>
				</li>
				<li>
					<button on:click={() => {app_name = "sharex"}}>
						<img src="/res/img/sharex.png" alt="ShareX logo" class="app_icon"/>
						Connect ShareX
					</button>
				</li>
			</ul>
		{/if}
	</div>
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}

.app_icon {
	height: 1.6em;
	vertical-align: middle;
}
.app_icon_small {
	height: 1em;
	vertical-align: middle;
}

.center {
	text-align: center;
}
.copy_container {
	display: flex;
}
.copy_textarea {
	flex: 1 1 auto;
}
.copy_button {
	flex: 0 0 auto;
}
</style>
