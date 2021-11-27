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
	if (e.key === 'Escape') {
		set_visible(false);
		return;
	}
};
</script>

<svelte:window on:keydown={keydown}/>

{#if visible}
<div class="background" use:load_bg on:click={hide} transition:fade={{duration: 200}}>
	<div class="window" use:load_modal on:click|stopPropagation role="dialog" aria-modal="true">
		<div class="header highlight_1">
			<slot name="title">
				<div class="title">{title}</div>
				<button class="button button_red round" on:click={hide}>
					<i class="icon">close</i>
				</button>
			</slot>
		</div>
		<div class="body">
			<slot></slot>
		</div>
	</div>
</div>
{/if}

<style>
.background {
	position: fixed;
	text-align: center;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.5);
}
.window {
	position: absolute;
	z-index: inherit;
	display: flex;
	flex-direction: column;
	background-color: var(--layer_2_color);
	max-height: 100%;
	max-width: 100%;
	margin: 0 auto;
	top: 20%;
	left: 50%;
	transform: translate(-50%, -20%);
	padding: 0;
	border-radius: 20px 20px 8px 8px;
	overflow: hidden;
	text-align: left;
	box-shadow: var(--shadow_color) 0px 0px 50px;
}
.header {
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	padding: 1px;
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
	padding: 10px;
}
</style>
