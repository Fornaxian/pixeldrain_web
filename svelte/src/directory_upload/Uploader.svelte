<script>
import DirectoryUploader from "./DirectoryUploader.svelte";

let uploader

let file_input_field
const file_input_change = e => {
	// Start uploading the files async
	uploader.add_files(e.target.files)

	// This resets the file input field
	file_input_field.nodeValue = ""
}
let dragging = false
const drop = e => {
	dragging = false;
	if (e.dataTransfer && e.dataTransfer.items.length > 0) {
		e.preventDefault()
		e.stopPropagation()
		uploader.add_files(e.dataTransfer.files)
	}
}
const paste = e => {
	if (e.clipboardData.files[0]) {
		e.preventDefault();
		e.stopPropagation();
		uploader.add_files(e.clipboardData.files)
	}
}

</script>

<svelte:window
	on:dragover|preventDefault|stopPropagation={() => { dragging = true }}
	on:dragenter|preventDefault|stopPropagation={() => { dragging = true }}
	on:dragleave|preventDefault|stopPropagation={() => { dragging = false }}
	on:drop={drop}
	on:paste={paste} />

<header style="padding-bottom: 50px;">
	<h1>Directory uploader</h1>

	<section>
		<div class="highlight_red">
			Pixeldrain's filesystem feature is still under development. Please
			don't upload anything you can't afford to lose
		</div>
	</section>
</header>


<section>

	<input bind:this={file_input_field} on:change={file_input_change} type="file" name="file" multiple="multiple"/>
	<button on:click={() => { file_input_field.click() }} class="big_button button_highlight">
		<i class="icon small">cloud_upload</i>
		<u>U</u>pload Files
	</button>
</section>

<DirectoryUploader bind:this={uploader}></DirectoryUploader>
