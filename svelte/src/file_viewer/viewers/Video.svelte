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
				<button on:click={() => dispatch("prev") }>
					<i class="icon">skip_previous</i>
				</button>
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
				<button on:click={() => dispatch("next") }>
					<i class="icon">skip_next</i>
				</button>
				<div style="width: 16px;"></div>
				<!-- <input bind:this={video_seeker} on:input={seek} class="seeker" type="range" min="0" max="1000" value="0"> -->
				<button on:click={mute} class:button_red={player && player.muted}>
					{#if player && player.muted}
						<i class="icon">volume_off</i>
					{:else}
						<i class="icon">volume_up</i>
					{/if}
				</button>
				<!-- <input bind:this={volume_seeker} on:input={volume_seek} class="volume_control" type="range" min="0" max="100" value="100"> -->
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
		The online video player on pixeldrain is only available when the
		uploader of the file is a Patreon supporter, or if you are a Patreon
		supporter. You can still download the video and watch it locally on your
		computer.
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
	text-align: center;
	overflow: hidden;
}
.controls {
	flex: 0 0 auto;
	display: flex;
	flex-direction: row;
	background-color: var(--layer_1_color);
	box-shadow: 1px 1px 6px var(--shadow_color);
	padding: 0 2px 2px 2px;
	align-items: center;
}
.controls > * {
	flex: 0 0 auto;
}
.controls > .spacer {
	flex: 1 1 auto;
}
/* .controls > .seeker {
	flex: 1 1 80%;
}
.controls > .volume_control {
	flex: 1 1 20%;
} */
.video {
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	top: 50%;
	transform: translateY(-50%);
	box-shadow: 1px 1px 6px var(--shadow_color);
}
.video_icon {
	display: inline-block;
	vertical-align: middle;
	border-radius: 8px;
}
</style>
