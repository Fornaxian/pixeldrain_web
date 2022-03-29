<script>
export let src = ""
export let border_top = false;
</script>

{#if src}
	<div class:border_top>
		<img class="image" src="{src}" alt="User-provided banner"/>
	</div>
{/if}

<style>
.border_top {
	border-top: solid 1px var(--separator);
}
.image {
	display: block;
	margin: auto;
	max-height: 100px;
	max-width: 100%;
}
</style>
