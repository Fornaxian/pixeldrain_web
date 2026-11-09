<script lang="ts">
let {
	highlight = false,
	highlight_on_click = false,
	red = false,
	round = false,
	flat = false,
	disabled = false,
	icon = "",
	icon_small = false,
	label = "",
	title = null,
	link_href = "",
	link_target = "_self",
	click = null,
	style = null,
	type = null,
	form = null
}: {
	highlight?: boolean;
	highlight_on_click?: boolean;
	red?: boolean;
	round?: boolean;
	flat?: boolean;
	disabled?: boolean;
	icon?: string;
	icon_small?: boolean;
	label?: string;
	title?: any;
	link_href?: string;
	link_target?: string;
	click?: (e?: MouseEvent) => void;
	style?: any;
	type?: any;
	form?: any;
} = $props();

let click_int = (e: MouseEvent) => {
	if (highlight_on_click) {
		try {
			click(e)
			highlight = true
		} catch (err) {
			red = true
			throw err
		}
	} else if (click !== null) {
		click(e)
	}
}
</script>

{#if link_href === ""}
	<button
		onclick={click_int}
		class="button"
		class:button_highlight={highlight}
		class:button_red={red}
		class:round
		class:flat
		title={title}
		style={style}
		type={type}
		form={form}
		disabled={disabled ? true:null}
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
	color: var(--body_text_color);
	box-shadow: none;
}
</style>
