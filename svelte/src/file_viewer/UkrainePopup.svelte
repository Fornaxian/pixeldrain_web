<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";

let visible = false

const close = () => {
	localStorage.setItem("ukraine_popup_dismissed", "🇺🇦")
	visible = false
}
onMount(() => {
	if (localStorage.getItem("ukraine_popup_dismissed") !== "🇺🇦") {
		visible = true
	}
})
</script>

{#if visible}
	<div in:fade out:fade class="notice highlight_yellow">
		<div class="text">
			🇺🇦 Russia has invaded Ukraine and is murdering its citizens! 🇺🇦<br/>
			There are a number of ways you can help:
			<a href="https://helpukrainewin.org/" rel="noreferrer" target="_blank">Click here for more information</a>.
		</div>
		<button on:click={close} class="close button_highlight round">
			<i class="icon">close</i>
		</button>
	</div>
{/if}

<style>
.notice {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.text {
	display: inline;
	flex: 1 1 auto;
}
.close {
	flex: 0 0 auto;
	margin: 0;
}
</style>
