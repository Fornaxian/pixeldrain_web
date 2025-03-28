<script lang="ts">
import type { FSNodeProperties } from "filesystem/FilesystemAPI";

export let properties: FSNodeProperties = {} as FSNodeProperties

let current_theme = -1

const set_theme = (index: number) => {
	current_theme = index

	// Copy all the properties of the theme to the file, except for the theme
	// name
	Object.keys(themes[index]).forEach(key => {
		if (key !== "name") {
			properties[key] = themes[index][key]
		}
	})
}

const themes = [
	{
		name: "PD classic",
		brand_input_color: "#2d2d2d",
		brand_highlight_color: "#75b72d",
		brand_danger_color: "#821b3f",
		brand_background_color: "#141414",
		brand_body_color: "#1e1e1e",
		brand_card_color: "#282828"
	}, {
		name: "Nord (dark)",
		brand_input_color: "#4f596d",
		brand_highlight_color: "#a4be8c",
		brand_danger_color: "#bd5f69",
		brand_background_color: "#2f3541",
		brand_body_color: "#3b4252",
		brand_card_color: "#434c5f"
	}, {
		name: "Nord (light)",
		brand_input_color: "#cad2e1",
		brand_highlight_color: "#a4be8c",
		brand_danger_color: "#bd5f69",
		brand_background_color: "#d7dde8",
		brand_body_color: "#ebeef3",
		brand_card_color: "#e5e9f0"
	}, {
		name: "Solarized (dark)",
		brand_input_color: "#084453",
		brand_highlight_color: "#849900",
		brand_danger_color: "#db302d",
		brand_background_color: "#002c38",
		brand_body_color: "#063540",
		brand_card_color: "#073c49"
	}, {
		name: "Solarized (light)",
		brand_input_color: "#e7dfc5",
		brand_highlight_color: "#849900",
		brand_danger_color: "#db302d",
		brand_background_color: "#ede7d3",
		brand_body_color: "#fdf5e2",
		brand_card_color: "#fcf2d8"
	}, {
		name: "Mocha",
		brand_input_color: "#313244",
		brand_highlight_color: "#a6e3a1",
		brand_danger_color: "#f38ba8",
		brand_background_color: "#1e1e2e",
		brand_body_color: "#181825",
		brand_card_color: "#313244"
	}
]
</script>

{#each themes as theme, index (theme.name)}
	<button class:button_highlight={current_theme === index} on:click={() => {set_theme(index)}}>
		{theme.name}
	</button>
{/each}
