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
	text-align: left;
	padding-left: 8px;
	vertical-align: middle;

	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 16px;
	padding: 8px;
}
.center {
	text-align: center;
}
</style>
