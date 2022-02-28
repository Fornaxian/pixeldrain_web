<script>
import { onMount,  createEventDispatcher, tick } from "svelte";
import LargeFileMessage from "./LargeFileMessage.svelte";
import TextBlock from "./TextBlock.svelte";
let dispatch = createEventDispatcher()

let file = {
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	get_href: "",
	icon_href: "",
	allow_video_player: true,
	show_ads: false,
}

$: loop = file.name.includes(".loop.")

let player
let video_reload = false
let media_session = false

export const set_file = async f => {
	let same_file = f.id == file.id
	file = f

	if (media_session) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: file.name,
			artist: "pixeldrain",
			album: "unknown",
		});
		console.log("updating media session")
	}

	// When the component receives a new ID the video track does not
	// automatically start playing the new video. So we use this little hack to
	// make sure that the video is unloaded and loaded when the ID changes
	if (!same_file) {
		video_reload = true
		await tick()
		video_reload = false
	}
}

onMount(() => {
	if ('mediaSession' in navigator) {
		media_session = true
		navigator.mediaSession.setActionHandler('play', () => player.play());
		navigator.mediaSession.setActionHandler('pause', () => player.pause());
		navigator.mediaSession.setActionHandler('stop', () => player.stop());
		navigator.mediaSession.setActionHandler('previoustrack', () => dispatch("prev", {}));
		navigator.mediaSession.setActionHandler('nexttrack', () => dispatch("next", {}));
	}
})

let download = () => { dispatch("download", {}) }
</script>

<div class="container">
	{#if file.allow_video_player}
		{#if !video_reload}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				bind:this={player}
				controls
				playsinline
				autoplay
				loop={loop}
				class="center drop_shadow"
				on:ended={() => {dispatch("next", {})}}
			>
				<source src={file.get_href} type={file.mime_type} />
			</video>
		{/if}
	{:else}
		<h1>{file.name}</h1>
		<img src={file.icon_href} class="video_icon" alt="Video icon">
		<TextBlock width="600px">
			The online video player on pixeldrain is only available when the
			uploader of the file you is a Patreon supporter, or if you are a
			Patreon supporter. You can still download the video and watch it
			locally on your computer.
			<br/>
			<button on:click={download}>
				<i class="icon">download</i> Download
			</button>
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12" class="button button_highlight">
				<i class="icon">bolt</i> Support Pixeldrain on Patreon
			</a>
		</TextBlock>
		<br/><br/>
		<LargeFileMessage file={file}></LargeFileMessage>
	{/if}
</div>

<style>
.container{
	display: block;
	height: 100%;
	width: 100%;
	text-align: center;
	overflow: hidden;
}
.center {
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	top: 50%;
	transform: translateY(-50%);
}
.video_icon {
	display: inline-block;
	vertical-align: middle;
	border-radius: 8px;
}
</style>
