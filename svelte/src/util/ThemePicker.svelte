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
	<button class="group_first" class:button_highlight={theme==="nord"} on:click={() => {set("nord")}}>
		Nord
	</button>
	<button class="group_middle" class:button_highlight={theme==="nord_dark"} on:click={() => {set("nord_dark")}}>
		dark
	</button>
	<button class="group_last" class:button_highlight={theme==="nord_light"} on:click={() => {set("nord_light")}}>
		light
	</button>
	<button class="group_first" class:button_highlight={theme==="solarized"} on:click={() => {set("solarized")}}>
		Solarized
	</button>
	<button class="group_middle" class:button_highlight={theme==="solarized_dark"} on:click={() => {set("solarized_dark")}}>
		dark
	</button>
	<button class="group_last" class:button_highlight={theme==="solarized_light"} on:click={() => {set("solarized_light")}}>
		light
	</button>
	<button class:button_highlight={theme==="purple_drain"} on:click={() => {set("purple_drain")}}>
		Purple drain
	</button>
	<button class:button_highlight={theme==="classic"} on:click={() => {set("classic")}}>
		Classic
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
