<script lang="ts">
let { symbol = "€", amount = 0, precision = 2 }: {
	symbol?: string;
	amount?: number;
	precision?: number;
} = $props();
</script>

<span>
	{symbol}
	<span class:red={amount < 0} class:green={amount > 0}>
		{(amount / 1000000).toLocaleString(undefined, {minimumFractionDigits: precision, maximumFractionDigits: precision})}
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
