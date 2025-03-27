<script>
import { tick } from "svelte"
import Modal from "../util/Modal.svelte"

export let file = {
	id: "",
	name: "",
	availability: "",
	download_href: "",
}
export let list = {
	id: "",
	title: "",
	download_href: "",
}

let load_captcha_script = false
let download_captcha_window
let captcha_type = "" // rate_limit or malware
let captcha_window_title = ""
let captcha_container

let error_window = null
let error_code = ""
let error_message = ""
export const download_file = () => {
	if (!window.viewer_data.captcha_key) {
		console.debug("Server doesn't support captcha, starting download", file.download_href)
		download(file.download_href, file.name)
		return
	}
	if (file.availability === "") {
		console.debug("File is available, starting download", file.download_href)
		download(file.download_href, file.name)
		return
	}
	if (!file.availability.endsWith("_captcha_required")) {
		error_code = file.availability
		error_message = file.availability_message
		error_window.show()
		console.debug("File is unavailable, showing error message")
		return
	}

	console.debug("File is not readily available, showing captcha dialog")

	// When the captcha is filled in by the user this function is called. Here
	// we trigger the download using the captcha token Google provided us with
	let captcha_complete_callback = token => {
		// Download the file using the recaptcha token
		console.debug("Captcha validation successful, starting download", file.download_href)
		download(file.download_href + "&recaptcha_response=" + token, file.name)
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
	} else if (
		file.availability === "ip_download_limited_captcha_required" ||
		file.availability === "ip_transfer_limited_captcha_required"
	) {
		captcha_type = "ip_rate_limit"
		captcha_window_title = "IP address rate limited"
	} else {
		captcha_window_title = "CAPTCHA required"
		error_code = file.availability
		error_message = file.availability_message
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
		download(list.download_href, list.title+".zip")
	}
}

const download = (href, file_name) => {
	let a = document.createElement("a")
	a.href = href
	a.download = file_name
	a.click()
	a.remove()
}
</script>

<svelte:head>
	{#if load_captcha_script}
		<script src="https://www.google.com/recaptcha/api.js?onload=captcha_script_loaded&render=explicit"></script>
	{/if}
</svelte:head>

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
	{:else if captcha_type === "ip_rate_limit"}
		<p class="indent">
			A lot of downloads have originated from this IP address lately.
			Please prove that you are not a robot:
		</p>
	{:else}
		<p class="indent">
			{error_message}
		</p>
		<p class="indent">
			Reponse code: {error_code}
		</p>
	{/if}
	<br/>
	<div bind:this={captcha_container} class="captcha_container"></div>
</Modal>

<Modal bind:this={error_window} title="Download error" width="500px" padding>
	<p>
		Can't download file: {error_code}
	</p>
	<p>
		{error_message}
	</p>
</Modal>

<style>
.captcha_container {
	text-align: center;
}
/* global() to silence the unused selector warning */
.captcha_container > :global(div) {
	display: inline-block;
}
</style>
