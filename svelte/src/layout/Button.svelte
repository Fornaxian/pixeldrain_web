<script>
export let highlight = false;
export let highlight_on_click = false
export let red = false;
export let round = false;
export let flat = false;
export let disabled = false;
export let icon = ""
export let icon_small = false;
export let label = ""
export let title = ""
export let link_href = ""
export let link_target = ""
export let click = e => {}
export let style = ""
export let type = ""
export let form = ""

let click_int = e => {
	if (highlight_on_click) {
		try {
			click(e)
			highlight = true
		} catch (err) {
			red = true
			throw err
		}
	} else {
		click(e)
	}
}
</script>

{#if link_target === ""}
	<button
		on:click={click_int}
		class="button"
		class:button_highlight={highlight}
		class:button_red={red}
		class:round
		class:flat
		title={title}
		style={style}
		type={type}
		form={form}
		disabled={disabled ? "disabled":""}
	>
		{#if icon !== ""}
			<i class="icon" class:small={icon_small}>{icon}</i>
		{/if}
		{#if label !== ""}
			<span>{label}</span>
		{/if}
	</button>
{:else}
	<a
		href="{link_href}"
		target={link_target}
		class="button"
		class:button_highlight={highlight}
		class:button_red={red}
		class:round
		class:flat
		title={title}
		style={style}
		disabled={disabled ? "disabled":""}
	>
		{#if icon !== ""}
			<i class="icon" class:small={icon_small}>{icon}</i>
		{/if}
		{#if label !== ""}
			<span>{label}</span>
		{/if}
	</a>
{/if}

<style>
.button {
	flex: 0 0 content;
}
.flat {
	background: none;
	margin: 0;
	color: var(--body_text_color);
}
</style>
