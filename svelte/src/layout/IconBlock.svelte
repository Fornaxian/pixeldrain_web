<script>
export let icon_href = ""
export let width = "750px"
</script>

<div class="block" style="width: {width}; max-width: 100%">
	<img src={icon_href} alt="File icon" class="icon">
	<div class="description">
		<slot></slot>
	</div>
</div>

<style>
.block {
	display: flex;
	flex-direction: row;
	margin: 8px auto;
}
@media(max-width: 400px) {
	.block {
		flex-direction: column;
	}
}

.icon {
	flex: 0 0 auto;
	margin-right: 8px;
	border-radius: 8px;
	/* Prevent icon from being stretched if text content is too large */
	align-self: center;
	width: 128px;
}
.description {
	flex: 1 1 auto;
	display: inline-block;
	text-align: initial;
	padding-left: 8px;
	vertical-align: middle;
	overflow-wrap: anywhere;
	background-color: var(--shaded_background);
	backdrop-filter: blur(4px);
	border-radius: 8px;
	padding: 8px;
}
</style>
