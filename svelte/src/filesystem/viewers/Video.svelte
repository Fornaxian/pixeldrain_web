<script>
import { fs_get_file_url } from "../FilesystemAPI.svelte";
import { createEventDispatcher, onMount } from 'svelte'
let dispatch = createEventDispatcher()

export let state;
let player
let media_session = false

// Detect when the song changes
$: update_session_meta(state.base.name)

const update_session_meta = name => {
	if (media_session) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: name,
			artist: "pixeldrain",
			album: "unknown",
		});
	}
}

onMount(() => {
	if ('mediaSession' in navigator) {
		media_session = true
		update_session_meta(state.base.name)

		navigator.mediaSession.setActionHandler('play', () => player.play());
		navigator.mediaSession.setActionHandler('pause', () => player.pause());
		navigator.mediaSession.setActionHandler('stop', () => player.stop());
		navigator.mediaSession.setActionHandler('previoustrack', () => dispatch("open_sibling", -1));
		navigator.mediaSession.setActionHandler('nexttrack', () => dispatch("open_sibling", 1));
	}
})
</script>

<div class="container">
	<video
		bind:this={player}
		class="player"
		src={fs_get_file_url(state.bucket.id, state.base.path)}
		autoplay="autoplay"
		controls="controls"
		on:ended={() => { dispatch("open_sibling", 1) }}>
		<track kind="captions"/>
</video>
</div>

<style>
.container {
	position: relative;
	display: block;
	height: 100%;
	width: 100%;
	text-align: center;
	overflow: hidden;
}
.player {
	position: relative;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	top: 50%;
	transform: translateY(-50%);
	box-shadow: 1px 1px 5px var(--shadow_color);
}
</style>
