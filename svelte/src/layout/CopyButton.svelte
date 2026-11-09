<script lang="ts">
import { copy_text } from "util/Util.svelte";

let {
	text = "",
	style = "",
	large_icon = false,
	small_icon = false,
	children
}: {
	text?: string;
	style?: string;
	large_icon?: boolean;
	small_icon?: boolean;
	children?: import('svelte').Snippet;
} = $props();
let failed = $state(false)
let success = $state(false)

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
	onclick={copy}
	style={style}
	class="button"
	class:button_highlight={success}
	class:button_red={failed}
	class:large_icon
	class:small_icon
	title="Copy text to clipboard"
	disabled={text === ""}
>
	<i class="icon i_content_copy"></i>
	<span>
		{#if success}
			Copied!
		{:else if failed}
			Copy failed
		{:else}
			{@render children?.()}
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
