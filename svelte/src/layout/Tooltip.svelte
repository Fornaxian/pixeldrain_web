<script lang="ts">
import Dialog from "./Dialog.svelte";

let button: HTMLButtonElement
let dialog: Dialog

const open = () => dialog.open(button.getBoundingClientRect())
</script>

<button bind:this={button} on:click={open} class="button round">
	<i class="icon">info</i><slot name="label"></slot>
</button>

<Dialog bind:this={dialog}>
	<div class="menu">
		<slot></slot>
	</div>
</Dialog>

<style>
.button {
	flex: 0 0 content;
	box-shadow: none;
}
.menu {
	display: flex;
	flex-direction: column;
	max-width: 20em;
}
</style>
