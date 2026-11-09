<script lang="ts">
let { src = "", link = "", border_top = false }: {
	src?: string;
	link?: string;
	border_top?: boolean;
} = $props();
</script>

{#if src}
	<div class:border_top>
		{#if link}
			<a href={link} target="_blank" rel="noreferrer">
				<img class="image" src="{src}" alt="User-provided banner"/>
			</a>
		{:else}
			<img class="image" src="{src}" alt="User-provided banner"/>
		{/if}
	</div>
{/if}

<style>
.border_top {
	border-top: solid 2px var(--separator);
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
