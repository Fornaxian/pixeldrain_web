<script lang="ts">
import { copy_text } from "util/Util.svelte";

export let text = ""
export let style = ""
export let large_icon = false
export let small_icon = false
let failed = false
let success = false

// Exported so it can be called manually
export const copy = () => {
	try {
		copy_text(text)
		success = true
	} catch (err) {
		console.error("Failed to copy text", err)
		failed = true
	}

	setTimeout(() => {
		success = false
		failed = false
	}, 10000)
}
</script>

<button
	on:click={copy}
	style={style}
	class="button"
	class:button_highlight={success}
	class:button_red={failed}
	class:large_icon
	class:small_icon
	title="Copy text to clipboard"
	disabled={text === ""}
>
	<i class="icon">content_copy</i>
	<span>
		{#if success}
			Copied!
		{:else if failed}
			Copy failed
		{:else}
			<slot></slot>
		{/if}
	</span>
</button>

<style>
.large_icon {
	flex-direction: column;
	min-width: 5em;
}
.large_icon>.icon {
	font-size: 40px;
	display: block;
}
.small_icon>.icon {
	font-size: 1.2em;
	display: block;
}
</style>
