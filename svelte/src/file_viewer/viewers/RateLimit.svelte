<script>
import { createEventDispatcher } from "svelte";
import LargeFileMessage from "./LargeFileMessage.svelte";
import TextBlock from "./TextBlock.svelte";
let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	name: "",
	mime_type: "",
}
</script>

<TextBlock width="800px">
	<h1>
		<i class="icon">file_download_off</i>
		Hotlink protection enabled
	</h1>

	<p>
		Hotlinking protection has been enabled for this file. This happens when
		a file is downloaded many times outside of our file viewer page (this
		page). Usually this means people are using download managers like
		JDownloader 2, Aria2 or wget. Using a download manager circumvents
		pixeldrain's advertisements and we lose money because of that. More
		information about this protection mechanism can be found on <a
		href="/#hotlinking">the home page</a>.
	</p>
	<p>
		This warning disappears when the you are a
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12" target="_blank">Patreon supporter</a>,
		or when the uploader of the file enables
		<a href="/user/subscription">bandwidth sharing</a> on their Pro account
		(and their data cap has not been used up). Using a download manager with
		a Pro account is allowed, it will not trigger this warning for other
		files.
	</p>
	<h2>
		Continue downloading
	</h2>
	<p>
		The file can be downloaded like usual by clicking the download button.
		You will have to complete a CAPTCHA test to prove that you're not a
		robot.
	</p>

	<img src={file.icon_href} alt="File icon" class="file_thumbnail">
	<div class="file_description">
		Name: {file.name}<br/>
		Type: {file.mime_type}<br/>
		<button class="button_highlight" on:click={() => {dispatch("download")}}>
			<i class="icon">save</i> Download
		</button>
		<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12" target="_blank" class="button button_highlight">
			<i class="icon">upgrade</i> Support Pixeldrain on Patreon
		</a>
	</div>
</TextBlock>
<br/><br/>
<LargeFileMessage file={file}></LargeFileMessage>

<style>
.file_thumbnail {
	display: inline-block;
	vertical-align: middle;
	height: 6em;
	border-radius: 8px;
}
.file_description {
	display: inline-block;
	text-align: left;
	padding-left: 8px;
	vertical-align: middle;
	max-width: 600px;
}
</style>
