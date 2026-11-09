<script lang="ts">
let { theme = "", on_theme_change }: {
	theme?: string;
	on_theme_change: (theme: string) => void;
} = $props();
let set = s => {
	theme = s
	on_theme_change(theme)
}

</script>

<div class="center">
	<button class:button_highlight={theme===""} onclick={() => {set("")}}>
		None
	</button>
	<button class="group_first" class:button_highlight={theme==="nord"} onclick={() => {set("nord")}}>
		Nord
	</button>
	<button class="group_middle" class:button_highlight={theme==="nord_dark"} onclick={() => {set("nord_dark")}}>
		dark
	</button>
	<button class="group_last" class:button_highlight={theme==="nord_light"} onclick={() => {set("nord_light")}}>
		light
	</button>
	<button class="group_first" class:button_highlight={theme==="solarized"} onclick={() => {set("solarized")}}>
		Solarized
	</button>
	<button class="group_middle" class:button_highlight={theme==="solarized_dark"} onclick={() => {set("solarized_dark")}}>
		dark
	</button>
	<button class="group_last" class:button_highlight={theme==="solarized_light"} onclick={() => {set("solarized_light")}}>
		light
	</button>
	<button class:button_highlight={theme==="purple_drain"} onclick={() => {set("purple_drain")}}>
		Purple drain
	</button>
	<button class:button_highlight={theme==="classic"} onclick={() => {set("classic")}}>
		Classic
	</button>
	<button class:button_highlight={theme==="maroon"} onclick={() => {set("maroon")}}>
		Maroon
	</button>
	<button class:button_highlight={theme==="hacker"} onclick={() => {set("hacker")}}>
		Hacker
	</button>
	<button class:button_highlight={theme==="canta"} onclick={() => {set("canta")}}>
		Canta
	</button>
	<button class:button_highlight={theme==="skeuos"} onclick={() => {set("skeuos")}}>
		Skeuos
	</button>
	<button class:button_highlight={theme==="sweet"} onclick={() => {set("sweet")}}>
		Sweet
	</button>
</div>

<style>
.center {
	text-align: center;
}
</style>
