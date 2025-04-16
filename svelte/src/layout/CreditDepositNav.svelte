<script lang="ts">
export let country: {name?: string, emoji?: string} = null
export let provider: {label: string} = null
export let vat = 0
</script>

<div style="display: flex;">
	{#if provider !== null}
		<button on:click={() => provider = null} style="flex: 0 0 auto;">
			<i class="icon">chevron_left</i>
			Change provider
		</button>
	{:else if country !== null}
		<button on:click={() => country = null} style="flex: 0 0 auto;">
			<i class="icon">chevron_left</i>
			Change country
		</button>
	{/if}
	<div style="flex: 1 1 auto;"></div>
	<div style="flex: 0 0 auto; display: flex; gap: 0.25em; align-items: center;">
		<span>Paying from</span>
		<span style="font-size: 1.5em; line-height: 1em;">{country.emoji}</span>
		<span>
			{country.name}
			({vat}% VAT)
			{#if provider !== null}with {provider.label}{/if}
		</span>
	</div>
</div>
