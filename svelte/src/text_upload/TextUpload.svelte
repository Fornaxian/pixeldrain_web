<script>
import { onMount } from "svelte";
import Modal from "../util/Modal.svelte";
import Behave from "behave-js";
import { add_upload_history } from "../util/Util.svelte";

let textarea
let help

onMount(() => {
	new Behave({
		textarea: textarea,
		autoStrip: false,
		autoOpen: false,
		overwrite: false,
		autoIndent: false,
		replaceTab: true,
		softTabs: false,
		tabSize: 8
	});
})

const upload_text = async () => {
	var filename = prompt(
		"What do you want to call this piece of textual art?\n\n" +
		"Please add your own file extension, if you want.",
		"Text file.txt"
	);

	if (!filename){
		return; // User pressed cancel
	}

	try {
		let form = new FormData()
		form.append("name", filename)
		form.append("file", new Blob([textarea.value], {type: "text/plain"}))

		let resp = await fetch(
			window.api_endpoint+"/file",
			{method: "POST", body: form}
		)
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}

		let id = (await resp.json()).id
		add_upload_history(id)

		window.location.href = "/u/" + id
	} catch (err) {
		alert("File upload failed: " + err)
		return
	}
}

// Upload the file when ctrl + s is pressed
const keydown = e => {
	if ((e.ctrlKey || e.metaKey) && e.key === "s") {
		e.preventDefault()
		upload_text();
		return false;
	}
}
</script>

<svelte:window on:keydown={keydown}></svelte:window>

<div id="text_editor" class="text_editor">
	<div id="headerbar" class="highlight_2 headerbar">
		<a href="/" class="button round">
			<i class="icon">arrow_back</i>
		</a>
		<div id="headerbar_spacer" class="headerbar_spacer"></div>
		<button class="button toolbar_button round" on:click={help.toggle}>
			<i class="icon">info</i> Information
		</button>
		<button class="button toolbar_button round button_highlight" on:click={upload_text}>
			<i class="icon">save</i> Save
		</button>
	</div>
	<div class="textarea_container">
		<!-- svelte-ignore a11y-autofocus -->
		<textarea bind:this={textarea} class="textarea" placeholder="Your text here..." autofocus="autofocus"></textarea>
	</div>
</div>

<Modal bind:this={help} title="Text editor help" padding width="500px">
	<p>
		You can type anything you want in here. When you're done press
		CTRL + S or click the Save button in the top right corner to
		upload your text file to pixeldrain.
	</p>
	<p>
		To show syntax highlighting on pixeldrain's file viewer you
		should save your file with a file extension like .js, .go,
		.java, etc. If you save your file with the extension .md or
		.markdown the result will be rendered as HTML on the file
		viewer.
	</p>
	<p>
		The text editor has been enhanced by Jacob Kelley's
		<a href="https://jakiestfu.github.io/Behave.js/" target="_blank">Behave.js</a>.

		Many thanks to him for developing this plugin and putting it
		under the MIT license.
	</p>
</Modal>

<style>
.text_editor {
	position: absolute;
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
}
.headerbar {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
}
.headerbar > * {
	flex: 0 0 auto;
	margin-left: 6px;
	margin-right: 6px;
}
.headerbar > .headerbar_spacer { flex: 1 1 auto; }
.textarea_container {
	flex: 1 1 auto;
	margin: 0;
	z-index: 9;
}
.textarea {
	position: relative;
	height: 100%;
	width: 100%;
	background: var(--layer_1_color);
	color: var(--text_color);
	margin: 0;
	border-radius: 0;
	box-shadow: none;
}
.textarea:focus { box-shadow: none; }
</style>
