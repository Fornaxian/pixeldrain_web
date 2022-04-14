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
	max-height: 90px;
	max-width: 100%;
}
@media(max-height: 600px) {
	.image {
		max-height: 60px;
	}
}
</style>
