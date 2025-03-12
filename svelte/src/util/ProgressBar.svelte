<script>
export let total = 0
export let used = 0
export let animation = "ease"
export let speed = 1000
export let no_animation = false
export let no_margin = false
export let style = ""
let percent = 0
$: {
	// Avoid division by 0
	if (total === 0) {
		total = 1
	}

	// Don't allow more than 100% progress
	if (used / total > 1) {
		percent = 100
	} else {
		percent = (used / total) * 100
	}
}
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
