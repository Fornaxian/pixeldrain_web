<script context="module">
// This makes sure new modals always show up on top of older modals. It is
// incremented every time a modal is shown
let global_index = 10000;
</script>
<script>
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';

export let title = "";
export let width = "800px";
export let height = "auto";
export let padding = false;
let visible = false;

const load_bg = background => {
	background.style.zIndex = global_index.valueOf();
	global_index++;
}
const load_modal = modal => {
	modal.style.width = width;
	modal.style.height = height;
}

const dispatch = createEventDispatcher();

export const show = () => { set_visible(true) }
export const hide = () => { set_visible(false) }
export const toggle = () => { set_visible(!visible) }
export const set_visible = vis => {
	visible = vis
	dispatch("is_visible", visible)
}

const keydown = e => {
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	if (e.key === 'Escape') {
		set_visible(false);
		e.preventDefault()
		return;
	}
};
</script>

<svelte:window on:keydown={keydown}/>

{#if visible}
<div class="background" use:load_bg on:click={hide} transition:fade={{duration: 200}} on:keydown={keydown}>
	<div class="top_padding"></div>
	<div class="window" use:load_modal on:click|stopPropagation role="dialog" aria-modal="true" on:keydown={keydown}>
		<div class="header">
			<slot name="title">
				<div class="title">{title}</div>
				<button class="button round" on:click={hide}>
					<i class="icon">close</i>
				</button>
			</slot>
		</div>
		<div class="body" class:padding>
			<slot></slot>
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
	background-color: rgba(0, 0, 0, 0.6);
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
	border-radius: 20px 20px 8px 8px;
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
}
.title {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	font-size: 1.2em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.button {
	flex-grow: 0;
	flex-shrink: 0;
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
