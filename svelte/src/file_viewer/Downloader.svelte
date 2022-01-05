<script>
import { tick } from "svelte"
import Modal from "../util/Modal.svelte"

export let file = {
	id: "",
	availability: "",
	download_href: "",
}
export let list = {
	id: "",
	download_href: "",
}

let download_frame
let load_captcha_script = false
let download_captcha_window
let captcha_type = "" // rate_limit or malware
let captcha_window_title = ""
let captcha_container
export const download_file = () => {
	if (!window.viewer_data.captcha_key) {
		console.debug("Server doesn't support captcha, starting download")
		download_frame.src = file.download_href
		return
	}
	if (file.availability === "") {
		console.debug("File is available, starting download")
		download_frame.src = file.download_href
		return
	}

	console.debug("File is not readily available, showing captcha dialog")

	// When the captcha is filled in by the user this function is called. Here
	// we trigger the download using the captcha token Google provided us with
	let captcha_complete_callback = token => {
		// Download the file using the recaptcha token
		download_frame.src = file.download_href + "&recaptcha_response=" + token
		download_captcha_window.hide()
	}

	// Function which will be called when the captcha script is loaded. This
	// renders the checkbox in the modal window
	window.captcha_script_loaded = async () => {
		download_captcha_window.show()
		await tick()
		grecaptcha.render(captcha_container, {
			sitekey: window.viewer_data.captcha_key,
			theme: "dark",
			callback: captcha_complete_callback,
		})
	}

	if (file.availability === "file_rate_limited_captcha_required") {
		captcha_type = "rate_limit"
		captcha_window_title = "Rate limiting enabled!"
	} else if (file.availability === "virus_detected_captcha_required") {
		captcha_type = "malware"
		captcha_window_title = "Malware warning!"
	}

	if (load_captcha_script) {
		console.debug("Captcha script is already loaded. Show the modal")
		captcha_script_loaded()
	} else {
		console.debug("Captcha script has not been loaded yet. Embedding now")
		load_captcha_script = true
	}
}
export const download_list = () => {
	if (list.id !== "") {
		download_frame.src = list.download_href
	}
}
</script>

<svelte:head>
	{#if load_captcha_script}
		<script src="https://www.google.com/recaptcha/api.js?onload=captcha_script_loaded&render=explicit"></script>
	{/if}
</svelte:head>

<iframe class="download_frame" bind:this={download_frame} title="File download frame"></iframe>
<Modal bind:this={download_captcha_window} title={captcha_window_title} width="500px">
	{#if captcha_type === "rate_limit"}
		<p class="indent">
			This file is using a suspicious amount of bandwidth relative to
			its popularity. To continue downloading this file you will have
			to prove that you're a human first.
		</p>
	{:else if captcha_type === "malware"}
		<p class="indent">
			According to our scanning systems this file may contain a virus.
			You can continue downloading this file at your own risk, but you
			will have to prove that you're a human first.
		</p>
	{/if}
	<br/>
	<div bind:this={captcha_container} class="captcha_container"></div>
</Modal>

<style>
.download_frame {
	position: absolute;
	display: none;
	width: 1px;
	height: 1px;
}
.captcha_container {
	text-align: center;
}
/* global() to silence the unused selector warning */
.captcha_container > :global(div) {
	display: inline-block;
}
</style>
