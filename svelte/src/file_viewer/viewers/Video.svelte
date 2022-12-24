<script>
import { onMount,  createEventDispatcher, tick } from "svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import TextBlock from "./TextBlock.svelte";
let dispatch = createEventDispatcher()

export let is_list = false
let file = {
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	get_href: "",
	icon_href: "",
	allow_video_player: true,
	show_ads: false,
	download_speed_limit: 0,
}

$: loop = file.name.includes(".loop.")

let player
let playing = false
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

const download = () => { dispatch("download", {}) }

const toggle_play = () => playing ? player.pause() : player.play()

// let video_seeker
// const seek = () => {
// 	player.fastSeek(player.duration * (video_seeker.value/1000))
// }

const seek_relative = delta => {
	player.fastSeek(player.currentTime + delta)
}

// let volume_seeker
// const volume_seek = () => {
// 	player.volume = volume_seeker.value/100
// }

const mute = () => {
	if (player.muted) {
		// volume_seeker.disabled = false
		player.muted = false
	} else {
		// volume_seeker.disabled = true
		player.muted = true
	}
}

const fullscreen = () => {
	player.requestFullscreen()
}
</script>

{#if file.allow_video_player}
	{#if !video_reload}
		<div class="container">
			<div class="player">
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					bind:this={player}
					controls
					playsinline
					autoplay
					loop={loop}
					class="video drop_shadow"
					on:pause={() => playing = false }
					on:play={() => playing = true }
					on:ended={() => dispatch("next", {})}
				>
					<source src={file.get_href} type={file.mime_type} />
				</video>
			</div>

			<div class="controls">
				<div class="spacer"></div>
				{#if is_list}
					<button on:click={() => dispatch("prev") }>
						<i class="icon">skip_previous</i>
					</button>
				{/if}
				<button on:click={() => seek_relative(-10)}>
					<i class="icon">replay_10</i>
				</button>
				<button on:click={toggle_play} class="button_highlight">
					{#if playing}
						<i class="icon">pause</i>
					{:else}
						<i class="icon">play_arrow</i>
					{/if}
				</button>
				<button on:click={() => seek_relative(10)}>
					<i class="icon">forward_10</i>
				</button>
				{#if is_list}
					<button on:click={() => dispatch("next") }>
						<i class="icon">skip_next</i>
					</button>
				{/if}
				<div style="width: 16px; height: 8px;"></div>
				<button on:click={mute} class:button_red={player && player.muted}>
					{#if player && player.muted}
						<i class="icon">volume_off</i>
					{:else}
						<i class="icon">volume_up</i>
					{/if}
				</button>
				<button on:click={fullscreen}>
					<i class="icon">fullscreen</i>
				</button>
				<div class="spacer"></div>
			</div>
		</div>

	{/if}
{:else}
	<h1>{file.name}</h1>
	<img src={file.icon_href} class="video_icon" alt="Video icon">
	<TextBlock width="600px">
		The online video player on pixeldrain is only available for registered
		users, or when the uploader of the video has a Pro account. You can
		still download the video and watch it locally on your computer without
		an account.
		<br/>
		<button on:click={download}>
			<i class="icon">download</i> Download
		</button>
		<a href="/register" class="button">
			<i class="icon">how_to_reg</i> Sign up
		</a>
		<a href="https://www.patreon.com/join/pixeldrain" target="_blank" class="button button_highlight" rel="noreferrer">
			<i class="icon">bolt</i> Get Pixeldrain Pro
		</a>
	</TextBlock>

	<br/><br/>
	{#if file.show_ads}
		<BandwidthUsage file={file} on:reload/>
	{/if}
{/if}

<style>
h1 {
	text-shadow: 1px 1px 3px var(--shadow_color);
	line-break: anywhere;
}
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
}
.player {
	flex: 1 1 auto;
	display: flex;
	justify-content: center;
	text-align: center;
	overflow: hidden;
}
.controls {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	background-color: var(--shaded_background);
	padding: 0 2px 2px 2px;
	align-items: center;
}
.controls > * {
	flex: 0 0 auto;
}
.controls > .spacer {
	flex: 1 1 auto;
}
.video {
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
}
.video_icon {
	display: inline-block;
	vertical-align: middle;
	border-radius: 8px;
}
@media(max-height: 500px) {
	.container {
		flex-direction: row;
	}
	.controls {
		flex-direction: column;
	}
}
</style>
