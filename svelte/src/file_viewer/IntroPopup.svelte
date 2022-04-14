<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";

let popup
let visible = false

export let target
$: set_target(target)
const set_target = el => {
	if (!el) {
		return
	}

	move_to_element(el)
	setTimeout(() => { move_to_element(el) }, 500)
}
const move_to_element = el => {
	if (visible && popup) {
		let rect = el.getBoundingClientRect()
		popup.style.top = (rect.top + el.offsetHeight + 20) + "px"
		popup.style.left = (rect.left + (el.clientWidth / 2) - 40) + "px"
	}
}
const close = () => {
	localStorage.setItem("viewer_intro_popup_dismissed", "🍆")
	visible = false
}
onMount(() => {
	if (localStorage.getItem("viewer_intro_popup_dismissed") === "🍆") {
		return
	}
	visible = true
})
</script>

{#if visible}
	<div bind:this={popup} in:fade out:fade class="intro_popup">
		<span class="light">Upload your own files here</span>
		<p style="margin: 0.4em 0;">
			With pixeldrain you can share your files anywhere on the web. The
			sky is the limit!
		</p>
		<button on:click={close} class="close button_highlight round">
			<i class="icon">check</i> Got it
		</button>
	</div>
{/if}

<style>
.intro_popup {
	position: absolute;
	top: 0;
	left: 0;
	width: 380px;
	max-width: 80%;
	height: auto;
	padding: 8px;
	background-color: var(--card_color);
	box-shadow: 1px 1px 10px -2px var(--shadow_color);
	border-radius: 20px;
	z-index: 50;
	transition: opacity .4s, left .5s, top .5s;
}
.intro_popup:before {
	content: "";
	display: block;
	position: absolute;
	left: 30px;
	top: -15px;
	border-bottom: 15px solid var(--card_color);
	border-left: 15px solid transparent;
	border-right: 15px solid transparent;
}
.light {
	font-size: 1.6em;
}
.close {
	float: right;
	margin: 0;
}
</style>
