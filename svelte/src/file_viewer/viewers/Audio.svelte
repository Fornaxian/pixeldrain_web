<script lang="ts">
import { tick } from "svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import FileTitle from "layout/FileTitle.svelte";

let { is_list = false, on_prev, on_next }: {
	is_list?: boolean;
	on_prev: () => void;
	on_next: () => void;
} = $props();
let file = $state({
	id: "",
	name: "",
	mime_type: "",
	get_href: "",
	show_ads: false,
	download_speed_limit: 0,
})

let loop = $derived(file.name.includes(".loop."))

let player: HTMLAudioElement = $state()
let playing = $state(false)
let audio_reload = $state(false)

export const set_file = async f => {
	let same_file = f.id == file.id
	file = f

	if ('mediaSession' in navigator) {
		navigator.mediaSession.setActionHandler('play', () => player.play());
		navigator.mediaSession.setActionHandler('pause', () => player.pause());
		navigator.mediaSession.setActionHandler('stop', () => player.pause());
		navigator.mediaSession.setActionHandler('previoustrack', () => on_prev());
		navigator.mediaSession.setActionHandler('nexttrack', () => on_next());
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
		audio_reload = true
		await tick()
		audio_reload = false
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
</script>

<div class="container">
	<FileTitle title={file.name}/>

	{#if is_list}
		<button onclick={on_prev}>
			<i class="icon">skip_previous</i>
		</button>
	{/if}
	<button onclick={() => player.currentTime -= 10}>
		<i class="icon">replay_10</i>
	</button>
	<button onclick={toggle_playback}>
		{#if playing}
			<i class="icon">pause</i>
		{:else}
			<i class="icon">play_arrow</i>
		{/if}
	</button>
	<button onclick={() => player.currentTime += 10}>
		<i class="icon">forward_10</i>
	</button>
	{#if is_list}
		<button onclick={on_next}>
			<i class="icon">skip_next</i>
		</button>
	{/if}
	<br/><br/>

	{#if file.id && !audio_reload}
		<!-- svelte-ignore a11y_media_has_caption -->
		<audio
			bind:this={player}
			class="player"
			controls
			playsinline
			autoplay
			loop={loop}
			onpause={() => playing = false}
			onplay={() => playing = true}
			onended={on_next}
		>
			<source src={file.get_href} type={file.mime_type} />
		</audio>
	{/if}

	<br/><br/>
	{#if file.show_ads}
		<BandwidthUsage/>
	{/if}
</div>

<style>
.container {
	width: 100%;
	margin: 30px 0 0 0;
	padding: 0;
	text-align: center;
}
.player {
	width: 90%;
}
</style>
