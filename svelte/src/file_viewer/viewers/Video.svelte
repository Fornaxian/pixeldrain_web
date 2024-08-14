<script>
import { onMount,  createEventDispatcher, tick } from "svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import IconBlock from "./IconBlock.svelte";
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

export const toggle_playback = () => {
	playing ? player.pause() : player.play()
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

const seek_relative = delta => {
	if (player.fastSeek) {
		player.fastSeek(player.currentTime + delta)
	} else {
		player.currentTime = player.currentTime + delta
	}
}

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

const keypress = e => {
	if (
		(e.ctrlKey || e.altKey || e.metaKey) ||
		(document.activeElement.type && (
			document.activeElement.type === "text" ||
			document.activeElement.type === "email" ||
			document.activeElement.type === "textarea"))
	) {
		// The first check is to prevent our keybindings from triggering then
		// the user uses a global keybind. The second check is to prevent the
		// shortcuts from firing if the user is entering text in an input field
		return
	}

	if (e.key === "h") {
		seek_relative(-20)
	} else if (e.key === "j") {
		seek_relative(-5)
	} else if (e.key === "k") {
		seek_relative(5)
	} else if (e.key === "l") {
		seek_relative(20)
	}
}
</script>

<svelte:window on:keypress={keypress} />

{#if file.allow_video_player}
	{#if !video_reload}
		<div class="container">

			{#if
				file.mime_type === "video/x-matroska" ||
				file.mime_type === "video/quicktime" ||
				file.mime_type === "video/x-ms-asf"
			}
				<div class="compatibility_warning">
					This video file type is not compatible with every web
					browser. If the video fails to play you can try downloading
					the video and watching it locally.
				</div>
			{/if}

			<div class="player_and_controls">
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					bind:this={player}
					controls
					playsinline
					loop={loop}
					class="player"
					on:pause={() => playing = false }
					on:play={() => playing = true }
					on:ended={() => dispatch("next", {})}
				>
					<source src={file.get_href} type={file.mime_type} />
				</video>

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
					<button on:click={toggle_playback} class="button_highlight">
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
		</div>

	{/if}
{:else}
	<h1>{file.name}</h1>

	<IconBlock icon_href={file.icon_href}>

		The online video player on pixeldrain is only available while logged in
		to an account, or if the uploading user has verified their e-mail
		address. You can still download the video and watch it locally on your
		computer without an account.

		<br/>
		<button on:click={download}>
			<i class="icon">download</i> Download
		</button>
		<a href="/login" class="button">
			<i class="icon">login</i> Log in
		</a>
		<a href="/register" class="button">
			<i class="icon">how_to_reg</i> Sign up
		</a>
	</IconBlock>

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
.player_and_controls {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	overflow: auto;
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
	overflow: auto;
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
	border-bottom: 2px solid #6666FF;
	padding: 4px;
}
</style>
