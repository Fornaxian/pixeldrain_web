<script>
import { fs_get_file_url } from "../FilesystemAPI.svelte";
import { createEventDispatcher } from 'svelte'
let dispatch = createEventDispatcher()

export let state;
</script>

<div class="container">
	<video
		class="player"
		src={fs_get_file_url(state.bucket.id, state.base.path)}
		autoplay="autoplay"
		controls="controls"
		on:ended={() => { dispatch("next") }}>
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
	box-shadow: 1px 1px var(--layer_3_shadow) var(--shadow_color);
}
</style>
