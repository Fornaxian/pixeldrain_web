<script>
export let width = "750px"
export let center = false
</script>

<div class="block" class:center style="width: {width};">
	<slot></slot>
</div>

<style>
.block {
	display: inline-block;
	text-align: initial;
	padding-left: 8px;
	vertical-align: middle;
	max-width: 100%;

	background-color: var(--shaded_background);
	border-radius: 8px;
	padding: 8px;
}
.center {
	text-align: center;
}
</style>
