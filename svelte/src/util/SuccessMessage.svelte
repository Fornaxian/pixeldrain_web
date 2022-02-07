<script>
let s = false
let m = ""

export const set = (success, message) => {
	s = success
	m = message
}
export const clear = () => {
	m = ""
}
</script>

{#if m}
	<div class:highlight_green={s} class:highlight_red={!s}>
		{m}
	</div>
{/if}
