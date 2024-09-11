<script>
import UploadLib from "./UploadLib.svelte";
import { drop_target } from "../../util/DropTarget.ts"

let upload_widget
</script>

<div class="wrapper" use:drop_target={{upload: (files) => upload_widget.upload_files(files)}}>
	<div class="upload_buttons">
		<button on:click={() => upload_widget.pick_files() } class="big_button button_highlight">
			<i class="icon small">cloud_upload</i>
			<span><u>U</u>pload Files</span>
		</button>
		<a href="/t" id="upload_text_button" class="button big_button button_highlight">
			<i class="icon small">text_fields</i>
			<span>Upload <u>T</u>ext</span>
		</a>
	</div>

	<div class="center">
		<UploadLib bind:this={upload_widget}/>
	</div>
</div>

<style>
.wrapper {
	border-radius: 4px;
}
.center {
	text-align: center;
}
.upload_buttons {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	gap: 8px;
}
.upload_buttons > * {
	flex: 1 1 auto;
}
.big_button {
	margin: 0;
	max-width: 300px;
	font-size: 1.4em;
	justify-content: center;
}
</style>
