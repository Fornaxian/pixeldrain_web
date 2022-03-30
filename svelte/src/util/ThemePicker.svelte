<script>
import { createEventDispatcher } from "svelte";
let dispatch = createEventDispatcher()

export let theme = ""
let set = s => {
	theme = s
	dispatch("theme_change", theme)
}

</script>

<div class="center">
	<button class:button_highlight={theme===""} on:click={() => {set("")}}>
		None
	</button>
	<button class:button_highlight={theme==="default"} on:click={() => {set("default")}}>
		Default (purple)
	</button>
	<button class:button_highlight={theme==="classic"} on:click={() => {set("classic")}}>
		Classic
	</button>
	<button class:button_highlight={theme==="solarized_dark"} on:click={() => {set("solarized_dark")}}>
		Solarized
	</button>
	<button class:button_highlight={theme==="maroon"} on:click={() => {set("maroon")}}>
		Maroon
	</button>
	<button class:button_highlight={theme==="hacker"} on:click={() => {set("hacker")}}>
		Hacker
	</button>
	<button class:button_highlight={theme==="canta"} on:click={() => {set("canta")}}>
		Canta
	</button>
	<button class:button_highlight={theme==="nord"} on:click={() => {set("nord")}}>
		Nord (dynamic)
	</button>
	<button class:button_highlight={theme==="nord_dark"} on:click={() => {set("nord_dark")}}>
		Nord (dark)
	</button>
	<button class:button_highlight={theme==="nord_light"} on:click={() => {set("nord_light")}}>
		Nord (light)
	</button>
	<button class:button_highlight={theme==="skeuos"} on:click={() => {set("skeuos")}}>
		Skeuos
	</button>
	<button class:button_highlight={theme==="sweet"} on:click={() => {set("sweet")}}>
		Sweet
	</button>
</div>

<style>
.center {
	text-align: center;
}
</style>
