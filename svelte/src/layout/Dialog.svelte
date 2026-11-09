<script lang="ts">
let { children }: {
	children?: import('svelte').Snippet;
} = $props();
let dialog: HTMLDialogElement = $state()

export const open = (button_rect: DOMRect) => {
	// Show the window so we can get the location
	dialog.showModal()

	const edge_offset = 2

	// Get the egdes of the screen, so the window does not spawn off-screen
	const dialog_rect = dialog.getBoundingClientRect()
	const max_left = window.innerWidth - dialog_rect.width - edge_offset
	const max_top = window.innerHeight - dialog_rect.height - edge_offset

	// Position the dialog in horizontally in the center of the button and
	// verticially below it
	const min_left = Math.max((button_rect.left + (button_rect.width/2)) - (dialog_rect.width/2), edge_offset)
	const min_top = Math.max(button_rect.bottom, edge_offset)

	// Place the window
	dialog.style.left = Math.round(Math.min(min_left, max_left)) + "px"
	dialog.style.top = Math.round(Math.min(min_top, max_top)) + "px"
}

// Attach a click handler so that the dialog is closed when the user clicks
// outside the dialog. The way this check works is that there is usually an
// element inside the dialog with all the content. When the click target is
// the dialog itself then the click was on the dialog background
const click = (e: MouseEvent) => {
	if (e.target === dialog) {
		dialog.close()
	}
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onclick={click}>
	{@render children?.()}
</dialog>

<style>
dialog {
	background-color: var(--card_color);
	color: var(--body_text_color);
	border-radius: 8px;
	border: none;
	padding: 4px;
	margin: 0;
	box-shadow: 2px 2px 10px -4px #000000;
}
</style>
