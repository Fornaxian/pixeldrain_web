<script>
export let width = "800px"
</script>

<div class="block" style="max-width: {width};">
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
</style>
