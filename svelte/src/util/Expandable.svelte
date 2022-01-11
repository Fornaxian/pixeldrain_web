<script>
export let expanded = false
export const toggle = () => {
	expanded = !expanded
}
</script>

<div class="expandable">
	<div class="header">
		<div class="title">
			<slot name="header"></slot>
		</div>

		<button class="bucket_expand" on:click={toggle}>
			{#if expanded}
			<i class="icon">expand_less</i>
			{:else}
			<i class="icon">expand_more</i>
			{/if}
		</button>
	</div>
	<div class="body" class:hidden={!expanded}>
		<slot></slot>
	</div>
</div>

<style>
.expandable {
	text-decoration: none;
	background-color: var(--layer_3_color);
	margin: 0.8em 0;
	border-radius: 6px;
	overflow: hidden;
}
.header {
	display: flex;
	flex-direction: row;
	color: var(--text_color);
}
.header:hover {
	background-color: var(--input_color_dark)
}
.title {
	flex: 1 1 auto;
	text-align: left;
}
.bucket_expand {
	flex: 0 0 auto;
	align-self: center;
	height: auto;
}
.body {
	display: flex;
	padding: 0.4em;
	flex-direction: column;
	text-decoration: none;
	border-top: 1px solid var(--layer_3_color_border);
	color: var(--text_color);
}
.hidden {
	display: none;
}
</style>
