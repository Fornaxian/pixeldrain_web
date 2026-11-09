<script lang="ts">
let {
	total = 0,
	used = 0,
	animation = "ease",
	speed = 1000,
	no_animation = false,
	no_margin = false,
	style = ""
}: {
	total?: number;
	used?: number;
	animation?: string;
	speed?: number;
	no_animation?: boolean;
	no_margin?: boolean;
	style?: string;
} = $props();

// Avoid division by 0, and don't allow more than 100% progress
let percent = $derived(Math.min(used / (total || 1), 1) * 100)
</script>

<div class="progress_bar_outer" style={style} class:no_margin>
	<div
		class="progress_bar_inner"
		class:no_animation
		style="width: {percent}%; transition-timing-function: {animation}; transition-duration: {speed}ms;">
	</div>
</div>

<style>
.progress_bar_outer {
	display: block;
	background: var(--background_color);
	width: 100%;
	height: 6px;
	border-radius: 6px;
	overflow: hidden;
	margin: 6px 0;
}
.progress_bar_inner {
	background: var(--highlight_background);
	height: 100%;
	width: 0;
	border-radius: 6px;
	transition-property: width;
}
.no_animation {
	transition-property: none;
}
.no_margin {
	margin: 0;
}
</style>
