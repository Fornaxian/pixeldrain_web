<script lang="ts">
import Spinner from "./Spinner.svelte";

let { loading = false }: {
	loading?: boolean;
} = $props();
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
}
</style>
