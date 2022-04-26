<script>
import Spinner from "./Spinner.svelte";

export let loading = false
</script>

{#if loading}
	<div class="container">
		<Spinner/>
	</div>
{/if}

<style>
.container {
	position: fixed;
	top: 10px;
	right: 10px;
	height: 120px;
	width: 120px;
	z-index: 1000;
}
</style>
