<script>
import { createEventDispatcher, onMount } from 'svelte'
import { fs_path_url } from '../FilesystemUtil';
import FileTitle from '../../file_viewer/viewers/FileTitle.svelte';
let dispatch = createEventDispatcher()

export let state
let player
let playing = false
let media_session = false

const toggle_play = () => playing ? player.pause() : player.play()

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

<slot></slot>
<div class="container">
	<FileTitle title={state.base.name}/>
	<button on:click={() => dispatch("open_sibling", -1) }><i class="icon">skip_previous</i></button>
	<button on:click={() => player.currentTime -= 10 }><i class="icon">replay_10</i></button>
	<button on:click={toggle_play}>
		{#if playing}
			<i class="icon">pause</i>
		{:else}
			<i class="icon">play_arrow</i>
		{/if}
	</button>
	<button on:click={() => player.currentTime += 10 }><i class="icon">forward_10</i></button>
	<button on:click={() => dispatch("open_sibling", 1) }><i class="icon">skip_next</i></button>
	<br/><br/>
	<audio
		bind:this={player}
		class="player"
		src={fs_path_url(state.base.path)}
		autoplay="autoplay"
		controls="controls"
		on:pause={() => playing = false }
		on:play={() => playing = true }
		on:ended={() => dispatch("open_sibling", 1) }>
		<track kind="captions"/>
	</audio>
</div>

<style>
.container {
	padding: 0;
	overflow-y: auto;
	text-align: center;
}
.player {
	width: 90%;
}
</style>
