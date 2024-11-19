<script>
import { onMount,  createEventDispatcher, tick } from "svelte";
import { fs_path_url } from "../FilesystemAPI.mjs";
let dispatch = createEventDispatcher()

export let nav

// Used to detect when the file path changes
let last_path = ""
let loaded = false

let player
let playing = false
let media_session = false
let loop = false

export const update = async () => {
	if (media_session) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: nav.base.name,
			artist: "pixeldrain",
			album: "unknown",
		});
		console.debug("Updating media session")
	}

	loop = nav.base.name.includes(".loop.")

	// When the component receives a new ID the video track does not
	// automatically start playing the new video. So we use this little hack to
	// make sure that the video is unloaded and loaded when the ID changes
	if (nav.base.path != last_path) {
		last_path = nav.base.path
		loaded = false
		await tick()
		loaded = true
	}
}

export const toggle_playback = () => {
	playing ? player.pause() : player.play()
}

export const seek = delta => {
	// fastseek can be pretty imprecise, so we don't use it for small seeks
	// below 5 seconds
	if (player.fastSeek && delta > 5) {
		player.fastSeek(player.currentTime + delta)
	} else {
		player.currentTime = player.currentTime + delta
	}
}

onMount(() => {
	if ('mediaSession' in navigator) {
		media_session = true
		navigator.mediaSession.setActionHandler('play', () => player.play());
		navigator.mediaSession.setActionHandler('pause', () => player.pause());
		navigator.mediaSession.setActionHandler('stop', () => player.stop());
		navigator.mediaSession.setActionHandler('previoustrack', () => dispatch("open_sibling", -1));
		navigator.mediaSession.setActionHandler('nexttrack', () => dispatch("open_sibling", 1));
	}
})

const mute = () => {
	if (player.muted) {
		player.muted = false
	} else {
		player.muted = true
	}
}

const fullscreen = () => {
	player.requestFullscreen()
}
</script>

<div class="container">
	{#if
		$nav.base.file_type === "video/x-matroska" ||
		$nav.base.file_type === "video/quicktime" ||
		$nav.base.file_type === "video/x-ms-asf"
	}
		<div class="compatibility_warning">
			This video file type is not compatible with every web
			browser. If the video fails to play you can try downloading
			the video and watching it locally.
		</div>
	{/if}
	<div class="player_and_controls">
		<div class="player">
			{#if loaded}
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					bind:this={player}
					controls
					playsinline
					autoplay
					loop={loop}
					class="video"
					on:pause={() => playing = false }
					on:play={() => playing = true }
					on:ended={() => dispatch("open_sibling", 1)}
				>
					<source src={fs_path_url($nav.base.path)} type={$nav.base.file_type} />
				</video>
			{/if}
		</div>

		<div class="controls">
			<div class="spacer"></div>
			<button on:click={() => dispatch("open_sibling", -1) }>
				<i class="icon">skip_previous</i>
			</button>
			<button on:click={() => seek(-10)}>
				<i class="icon">replay_10</i>
			</button>
			<button on:click={toggle_playback} class="button_highlight">
				{#if playing}
					<i class="icon">pause</i>
				{:else}
					<i class="icon">play_arrow</i>
				{/if}
			</button>
			<button on:click={() => seek(10)}>
				<i class="icon">forward_10</i>
			</button>
			<button on:click={() => dispatch("open_sibling", 1) }>
				<i class="icon">skip_next</i>
			</button>
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
</div>

<style>
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
}
.player_and_controls {
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
	backdrop-filter: blur(4px);
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
@media(max-height: 500px) {
	.player_and_controls {
		flex-direction: row;
	}
	.controls {
		flex-direction: column;
	}
}
.compatibility_warning {
	background-color: var(--shaded_background);
	backdrop-filter: blur(4px);
	border-bottom: 2px solid #6666FF;
	padding: 4px;
}
</style>
