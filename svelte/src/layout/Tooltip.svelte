<script lang="ts">
let button: HTMLButtonElement
let dialog: HTMLDialogElement

export let style = ""

const open = () => {
	// Show the window so we can get the location
	dialog.showModal()

	const edge_offset = 5

	// Get the egdes of the screen, so the window does not spawn off-screen
	const window_rect = dialog.getBoundingClientRect()
	const max_left = window.innerWidth - window_rect.width - edge_offset
	const max_top = window.innerHeight - window_rect.height - edge_offset

	// Get the location of the button
	const button_rect = button.getBoundingClientRect()

	// Prevent the window from being glued to the edges
	const min_left = Math.max((button_rect.left + (button_rect.width/2)) - (window_rect.width/2), edge_offset)
	const min_top = Math.max(button_rect.bottom, edge_offset)

	// Place the window
	dialog.style.left = Math.round(Math.min(min_left, max_left)) + "px"
	dialog.style.top = Math.round(Math.min(min_top, max_top)) + "px"
}

// Close the dialog when the user clicks the background
const click = (e: Event) => {
	if (e.target === dialog) {
		dialog.close()
	}
}
</script>

<button bind:this={button} on:click={open} class="button round" style={style}>
	<i class="icon">info</i><slot name="label"></slot>
</button>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click={click}>
	<div class="menu">
		<slot></slot>
	</div>
</dialog>

<style>
.button {
	flex: 0 0 content;
	box-shadow: none;
}

dialog {
	text-align: initial;
	background-color: var(--card_color);
	color: var(--body_text_color);
	border-radius: 8px;
	border: none;
	padding: 0.5em;
	margin: 0;
	box-shadow: 2px 2px 10px var(--shadow_color);
}
.menu {
	display: flex;
	flex-direction: column;
	max-width: 20em;
}
</style>
