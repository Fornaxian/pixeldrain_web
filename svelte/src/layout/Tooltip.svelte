<script lang="ts">
import Dialog from "./Dialog.svelte";
let { label, children }: {
	label?: import('svelte').Snippet;
	children?: import('svelte').Snippet;
} = $props();

let button: HTMLButtonElement = $state()
let dialog: Dialog = $state()

const open = () => dialog.open(button.getBoundingClientRect())
</script>

<button bind:this={button} onclick={open} class="button round">
	<i class="icon">info</i>
	{@render label?.()}
</button>

<Dialog bind:this={dialog}>
	<div class="menu">
		{@render children?.()}
	</div>
</Dialog>

<style>
.button {
	flex: 0 0 content;
	box-shadow: none;
}
.button > .icon {
	font-size: 1em;
	margin-right: 0.4em;
}
.menu {
	display: flex;
	flex-direction: column;
	max-width: 20em;
}
</style>
