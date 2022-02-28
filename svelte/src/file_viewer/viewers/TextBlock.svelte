<script>
export let width = "800px"
export let center = false
</script>

<div class="block" class:center style="max-width: {width};">
	<slot></slot>
</div>

<style>
.block {
	display: inline-block;
	text-align: initial;
	padding-left: 8px;
	vertical-align: middle;

	color: var(--layer_1_text_color);
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 8px;
	padding: 8px;
}
.center {
	text-align: center;
}
</style>
