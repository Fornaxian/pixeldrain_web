<script lang="ts">
import { onMount, tick } from "svelte";
import { video_position } from "lib/VideoPosition";
import BandwidthUsage from "./BandwidthUsage.svelte";
import IconBlock from "layout/IconBlock.svelte";

let { is_list = false, on_prev, on_next, on_download }: {
	is_list?: boolean;
	on_prev: () => void;
	on_next: () => void;
	on_download: () => void;
} = $props();
let file = $state({
	id: "",
	size: 0,
	name: "",
	mime_type: "",
	get_href: "",
	icon_href: "",
	allow_video_player: true,
	show_ads: false,
	download_speed_limit: 0,
})

let loop = $derived(file.name.includes(".loop."))

let player: HTMLVideoElement = $state()
let playing = $state(false)
let video_reload = $state(false)
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

export const toggle_playback = () => playing ? player.pause() : player.play()
export const toggle_mute = () => player.muted = !player.muted

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
		navigator.mediaSession.setActionHandler('stop', () => player.pause());
		navigator.mediaSession.setActionHandler('previoustrack', () => on_prev());
		navigator.mediaSession.setActionHandler('nexttrack', () => on_next());
	}
})

const fullscreen = () => {
	if (document.fullscreenElement === null) {
		player.requestFullscreen()
	} else {
		document.exitFullscreen()
	}
}

const keypress = e => {
	if (
		(e.ctrlKey || e.altKey || e.metaKey) ||
		((document.activeElement as any).type && (
			(document.activeElement as any).type === "text" ||
			(document.activeElement as any).type === "email" ||
			(document.activeElement as any).type === "textarea"))
	) {
		// The first check is to prevent our keybindings from triggering then
		// the user uses a global keybind. The second check is to prevent the
		// shortcuts from firing if the user is entering text in an input field
		return
	}

	if (e.key === "f") {
		fullscreen()
	}
}
const video_keydown = e => {
	if (e.key === " ") {
		// Prevent spacebar from pausing playback in Chromium. This conflicts
		// with our own global key handler, causing the video to immediately
		// pause again after unpausing.
		e.stopPropagation()
	}
}
</script>

<svelte:window onkeypress={keypress} />

{#if file.allow_video_player}
	{#if !video_reload}
		<div class="container">

			{#if
				file.mime_type === "video/x-matroska" ||
				file.mime_type === "video/matroska" ||
				file.mime_type === "video/quicktime" ||
				file.mime_type === "video/x-ms-asf"}
				<div class="compatibility_warning">
					This video file type is not compatible with every web
					browser. If the video fails to play you can try downloading
					the video and watching it locally.
				</div>
			{/if}

			<div class="player_and_controls">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					bind:this={player}
					controls
					playsinline
					loop={loop}
					class="player"
					onpause={() => playing = false}
					onplay={() => playing = true}
					onended={on_next}
					onkeydown={video_keydown}
					use:video_position={() => file.id}
				>
					<source src={file.get_href} type={file.mime_type} />
				</video>

				<div class="controls">
					<div class="spacer"></div>
					{#if is_list}
						<button onclick={on_prev}>
							<i class="icon i_skip_previous"></i>
						</button>
					{/if}
					<button onclick={() => seek(-10)}>
						<i class="icon i_replay_10"></i>
					</button>
					<button onclick={toggle_playback} class="button_highlight">
						{#if playing}
							<i class="icon i_pause"></i>
						{:else}
							<i class="icon i_play_arrow"></i>
						{/if}
					</button>
					<button onclick={() => seek(10)}>
						<i class="icon i_forward_10"></i>
					</button>
					{#if is_list}
						<button onclick={on_next}>
							<i class="icon i_skip_next"></i>
						</button>
					{/if}
					<div style="width: 16px; height: 8px;"></div>
					<button onclick={toggle_mute} class:button_red={player && player.muted}>
						{#if player && player.muted}
							<i class="icon i_volume_off"></i>
						{:else}
							<i class="icon i_volume_up"></i>
						{/if}
					</button>
					<button onclick={fullscreen}>
						<i class="icon i_fullscreen"></i>
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
		<button onclick={on_download}>
			<i class="icon i_download"></i> Download
		</button>
		<a href="/login" class="button">
			<i class="icon i_login"></i> Log in
		</a>
		<a href="/register" class="button">
			<i class="icon i_how_to_reg"></i> Sign up
		</a>
	</IconBlock>

	{#if file.show_ads}
		<BandwidthUsage/>
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
