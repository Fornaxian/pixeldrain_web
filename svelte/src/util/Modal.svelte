<script context="module">
// This makes sure new modals always show up on top of older modals. It is
// incremented every time a modal is shown
let global_index = 10000;
</script>

<script>
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import Button from '../layout/Button.svelte';

// Form can be used to turn the modal into a save dialog. Enter the ID of a form
// inside the modal and the modal will provide a submit button for that form
export let form = ""

export let title = "";
export let width = "800px";
export let height = "auto";
export let padding = false;
export let visible = false;
export let style = "";

const load_bg = background => {
	background.style.zIndex = global_index.valueOf();
	global_index++;
}

const dispatch = createEventDispatcher();

export const show = () => { set_visible(true) }
export const hide = () => { set_visible(false) }
export const toggle = () => { set_visible(!visible) }
export const is_visible = () => { return visible }
export const set_visible = vis => {
	visible = vis
	dispatch("is_visible", visible)
}

const keydown = e => {
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	if (e.key === 'Escape' && visible) {
		set_visible(false);
		e.preventDefault()
		e.stopPropagation()
		return;
	}
};
</script>

<svelte:window on:keydown={keydown}/>

{#if visible}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div
		class="background"
		style={style}
		use:load_bg
		on:click={hide}
		transition:fade={{duration: 200}}
		on:keydown={keydown}
		role="dialog"
	>
		<div class="top_padding"></div>
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			class="window"
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
			style="width: {width}; height: {height};"
			on:keydown={keydown}
		>
			<div class="header">
				<slot name="title">
					{#if form !== ""}
						<Button round click={hide} icon="close"/>
						<span class="title">{title}</span>
						<Button round highlight type="submit" form={form} click={hide} icon="save" label="Save"/>
					{:else}
						<span class="title">{title}</span>
						<Button round click={hide} icon="close" />
					{/if}
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
