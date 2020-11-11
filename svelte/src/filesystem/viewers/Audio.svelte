<script>
import { createEventDispatcher } from 'svelte'
let dispatch = createEventDispatcher()

export let node;

const ended = () => {
	dispatch("next")
}

</script>

<div class="container">
	{node.base.name}
	<br/><br/>
	<audio
		class="player"
		src={window.apiEndpoint+"/filesystem/"+node.bucket.id+"/"+node.base.path}
		autoplay="autoplay"
		controls="controls"
		on:ended={ended}>
		<track kind="captions"/>
	</audio>
</div>

<style>
.container {
	height: 100%;
	width: 100%;
	margin: 50px 0 0 0;
	padding: 0;
	overflow-y: auto;
	text-align: center;
}
.player {
	width: 90%;
}
</style>
