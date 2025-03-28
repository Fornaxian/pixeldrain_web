<script lang="ts">
import { onMount } from 'svelte'
import { fs_path_url, fs_encode_path, fs_node_icon } from "filesystem/FilesystemAPI"
import FileTitle from "layout/FileTitle.svelte";
import TextBlock from "layout/TextBlock.svelte"
import type { FSNavigator } from 'filesystem/FSNavigator';

export let nav: FSNavigator
let player: HTMLAudioElement
let playing = false
let media_session = false
let siblings = []

export const toggle_playback = () => playing ? player.pause() : player.play()
export const toggle_mute = () => player.muted = !player.muted

export const seek = (delta: number) => {
	// fastseek can be pretty imprecise, so we don't use it for small seeks
	// below 5 seconds
	if (player.fastSeek && delta > 5) {
		player.fastSeek(player.currentTime + delta)
	} else {
		player.currentTime = player.currentTime + delta
	}
}

export const update = async () => {
	if (media_session) {
		navigator.mediaSession.metadata = new MediaMetadata({
			title: nav.base.name,
			artist: "pixeldrain",
			album: "unknown",
		});
	}

	siblings = await nav.get_siblings()
}

onMount(() => {
	if ('mediaSession' in navigator) {
		media_session = true
		navigator.mediaSession.setActionHandler('play', () => player.play());
		navigator.mediaSession.setActionHandler('pause', () => player.pause());
		navigator.mediaSession.setActionHandler('stop', () => player.pause());
		navigator.mediaSession.setActionHandler('previoustrack', () => nav.open_sibling(-1));
		navigator.mediaSession.setActionHandler('nexttrack', () => nav.open_sibling(1));
	}
})
</script>

<slot></slot>

<FileTitle title={$nav.base.name}/>

<TextBlock width="1000px">
	<audio
		bind:this={player}
		class="player"
		src={fs_path_url($nav.base.path)}
		autoplay
		controls
		on:pause={() => playing = false }
		on:play={() => playing = true }
		on:ended={() => nav.open_sibling(1) }>
		<track kind="captions"/>
	</audio>
	<div style="text-align: center;">
		<button on:click={() => nav.open_sibling(-1) }><i class="icon">skip_previous</i></button>
		<button on:click={() => seek(-10) }><i class="icon">replay_10</i></button>
		<button on:click={toggle_playback}>
			{#if playing}
				<i class="icon">pause</i>
			{:else}
				<i class="icon">play_arrow</i>
			{/if}
		</button>
		<button on:click={() => seek(10) }><i class="icon">forward_10</i></button>
		<button on:click={() => nav.open_sibling(1) }><i class="icon">skip_next</i></button>
	</div>

	<h2>Tracklist</h2>
	{#each siblings as sibling (sibling.path)}
		<a
			href={"/d"+fs_encode_path(sibling.path)}
			on:click|preventDefault={() => nav.navigate(sibling.path, true)}
			class="node"
		>
			{#if sibling.path === $nav.base.path}
				<i class="play_arrow icon">play_arrow</i>
			{:else}
				<img src={fs_node_icon(sibling, 64, 64)} class="node_icon" alt="icon"/>
			{/if}
				<span>{sibling.name}</span>
			<br/>
		</a>
	{/each}
</TextBlock>

<style>
.player {
	width: 100%;
}
.node {
	display: flex;
	flex-direction: row;
	color: var(--body_text_color);
	text-decoration: none;
	align-items: center;
	border-bottom: 1px solid var(--separator);
}
.node_icon {
	margin: 4px;
	width: 1.5em;
	height: 1.5em;
}
.play_arrow {
	margin: 4px;
}
</style>
