<script>
// Whether the Expandable is expanded by default
export let expanded = false
export const toggle = () => {
	expanded = !expanded
}

// Allow the user to expand the Expandable by clicking the title. Use
// stopPropagation if you want to use other interactive elements in the title
// bar
export let click_expand = false
const header_click = () => {
	if (click_expand) {
		toggle()
	}
}

// Highlight the title bar if the user moves their mouse over it
export let highlight = false
</script>

<div class="expandable">
	<div class="header" class:click_expand class:highlight on:click={header_click}>
		<div class="title">
			<slot name="header"></slot>
		</div>

		<button class="bucket_expand" on:click|stopPropagation={toggle}>
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
	background-color: var(--popout_color);
	margin: 0.6em 0;
	border-radius: 6px;
	overflow: hidden;
}
.header {
	display: flex;
	flex-direction: row;
	color: var(--body_text_color);
}
.click_expand:hover, .highlight:hover {
	background: var(--input_background);
	color: var(--input_text);
}
.click_expand {
	cursor: pointer;
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
	border-top: 1px solid var(--separator);
}
.hidden {
	display: none;
}
</style>
