<script>
import { createEventDispatcher, tick } from "svelte";
import BandwidthUsage from "./BandwidthUsage.svelte";
import FileTitle from "./FileTitle.svelte";
let dispatch = createEventDispatcher()

export let is_list = false
let file = {
	id: "",
	name: "",
	mime_type: "",
	get_href: "",
	show_ads: false,
	download_speed_limit: 0,
}

$: loop = file.name.includes(".loop.")

let player
let playing = false
let audio_reload = false

export const set_file = async f => {
	let same_file = f.id == file.id
	file = f

	if ('mediaSession' in navigator) {
		navigator.mediaSession.setActionHandler('play', () => player.play());
		navigator.mediaSession.setActionHandler('pause', () => player.pause());
		navigator.mediaSession.setActionHandler('stop', () => player.stop());
		navigator.mediaSession.setActionHandler('previoustrack', () => dispatch("prev", {}));
		navigator.mediaSession.setActionHandler('nexttrack', () => dispatch("next", {}));
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

const toggle_play = () => playing ? player.pause() : player.play()

</script>

<div class="container">
	<FileTitle title={file.name}/>

	{#if is_list}
		<button on:click={() => dispatch("prev") }>
			<i class="icon">skip_previous</i>
		</button>
	{/if}
	<button on:click={() => player.currentTime -= 10 }>
		<i class="icon">replay_10</i>
	</button>
	<button on:click={toggle_play}>
		{#if playing}
			<i class="icon">pause</i>
		{:else}
			<i class="icon">play_arrow</i>
		{/if}
	</button>
	<button on:click={() => player.currentTime += 10 }>
		<i class="icon">forward_10</i>
	</button>
	{#if is_list}
		<button on:click={() => dispatch("next") }>
			<i class="icon">skip_next</i>
		</button>
	{/if}
	<br/><br/>

	{#if file.id && !audio_reload}
		<!-- svelte-ignore a11y-media-has-caption -->
		<audio
			bind:this={player}
			class="player"
			controls
			playsinline
			autoplay
			loop={loop}
			on:pause={() => playing = false }
			on:play={() => playing = true }
			on:ended={() => {dispatch("next", {})}}
		>
			<source src={file.get_href} type={file.mime_type} />
		</audio>
	{/if}

	<br/><br/>
	{#if file.show_ads}
		<BandwidthUsage file={file} on:reload/>
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
