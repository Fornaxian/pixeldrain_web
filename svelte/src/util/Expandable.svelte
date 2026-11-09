<script lang="ts">
let {
	expanded = $bindable(false),
	nopad = false,
	click_expand = false,
	on_expand,
	highlight = false,
	header,
	children
}: {
	// Whether the Expandable is expanded by default
	expanded?: boolean;
	nopad?: boolean;
	// Allow the user to expand the Expandable by clicking the title. Use
	// stopPropagation if you want to use other interactive elements in the
	// title bar
	click_expand?: boolean;
	on_expand?: (expanded: boolean) => void;
	// Highlight the title bar if the user moves their mouse over it
	highlight?: boolean;
	header?: import('svelte').Snippet;
	children?: import('svelte').Snippet;
} = $props();

export const toggle = () => {
	expanded = !expanded
}

const header_click = () => {
	if (click_expand) {
		toggle()
		if (on_expand !== undefined) {
			on_expand(expanded)
		}
	}
}

const keypress = e => {
	if (e.code === "Space") {
		if (click_expand) {
			toggle()
		}
	}
}
</script>

<div class="expandable">
	<div
		class="header"
		class:click_expand
		class:highlight
		role="button"
		tabindex="0"
		onclick={header_click}
		onkeypress={keypress}
	>
		<div class="title">
			{@render header?.()}
		</div>

		<button class="bucket_expand" onclick={e => {e.stopPropagation(); toggle()}}>
			{#if expanded}
				<i class="icon i_expand_less"></i>
			{:else}
				<i class="icon i_expand_more"></i>
			{/if}
		</button>
	</div>
	{#if expanded}
		<div class="body" class:nopad>
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
.expandable {
	text-decoration: none;
	background-color: var(--card_color);
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
	padding: 0.5em;
	border-top: 1px solid var(--separator);
}
.nopad {
	padding: 0;
}
</style>
