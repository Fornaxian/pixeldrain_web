<script>
export let width = "750px"
export let center = false
</script>

<div class="block" class:center style="width: {width};">
	<slot></slot>
</div>

<style>
.block {
	display: block;
	text-align: initial;
	max-width: 100%;
	overflow-wrap: anywhere;
	margin: 8px auto;

	background-color: var(--shaded_background);
	border-radius: 8px;
	padding: 8px;
}
.center {
	text-align: center;
}
</style>
