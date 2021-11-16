<script>
export let amount = 0
export let precision = 2
</script>

<span>
	€
	<span class:red={amount < 0} class:green={amount > 0}>
		{(amount / 1000000).toFixed(precision)}
	</span>
</span>

<style>
.red {
	color: var(--danger_color);
}
.green {
	color: var(--highlight_color);
}
</style>
