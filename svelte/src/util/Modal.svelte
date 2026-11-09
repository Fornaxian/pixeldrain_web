<script module>
// This makes sure new modals always show up on top of older modals. It is
// incremented every time a modal is shown
let global_index = 10000;
</script>

<script lang="ts">
import { fade } from "svelte/transition";
import Button from "layout/Button.svelte";

let {
	form = "",
	title = "",
	width = "800px",
	height = "auto",
	padding = false,
	visible = $bindable(false),
	style = "",
	header,
	children
}: {
	// Form can be used to turn the modal into a save dialog. Enter the ID of a
	// form inside the modal and the modal will provide a submit button for that
	// form
	form?: string;
	title?: string;
	width?: string;
	height?: string;
	padding?: boolean;
	visible?: boolean;
	style?: string;
	header?: import('svelte').Snippet;
	children?: import('svelte').Snippet;
} = $props();

const load_bg = background => {
	background.style.zIndex = global_index.valueOf();
	global_index++;
}

export const show = () => { set_visible(true) }
export const hide = () => { set_visible(false) }
export const toggle = () => { set_visible(!visible) }
export const is_visible = () => { return visible }
export const set_visible = vis => {
	visible = vis
}

const keydown = e => {
	if ((document.activeElement as any).type && (document.activeElement as any).type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	if (e.key === "Escape" && visible) {
		set_visible(false);
		e.preventDefault()
		e.stopPropagation()
		return;
	}
};
</script>

<svelte:window onkeydown={keydown}/>

{#if visible}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="background"
		style={style}
		use:load_bg
		onclick={hide}
		transition:fade={{duration: 200}}
		onkeydown={keydown}
		role="dialog"
	>
		<div class="top_padding"></div>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			class="window"
			onclick={e => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			style="width: {width}; height: {height};"
			onkeydown={keydown}
		>
			<div class="header">
				{#if header}
					{@render header()}
				{:else if form !== ""}
					<Button round click={hide} icon="close"/>
					<span class="title">{title}</span>
					<Button round highlight type="submit" form={form} click={hide} icon="save" label="Save"/>
				{:else}
					<span class="title">{title}</span>
					<Button round click={hide} icon="close" />
				{/if}
			</div>
			<div class="body" class:padding>
				{@render children?.()}
			</div>
		</div>
		<div class="bottom_padding"></div>
	</div>
{/if}

<style>
.background {
	position: fixed;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.7);
}
/* The modal looks weird when it's in the dead center of the page, so we use
these padding divs to move it 25% up */
.top_padding { flex: 1 1 25%; }
.bottom_padding { flex: 1 1 75%; }

.window {
	position: relative;
	z-index: inherit;
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	background: var(--body_color);
	max-height: 100%;
	max-width: 100%;
	padding: 0;
	border-radius: 18px 18px 8px 8px;
	overflow: hidden;
	text-align: left;
}
.header {
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	padding: 1px;
	background: var(--background_color);
	color: var(--background_text_color);
	align-items: center;
}
.title {
	flex-grow: 1;
	flex-shrink: 1;
	font-size: 1.1em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	text-align: center;
}
.body {
	flex-grow: 1;
	flex-shrink: 1;
	overflow: auto;
}
.padding {
	padding: 10px;
}
</style>
