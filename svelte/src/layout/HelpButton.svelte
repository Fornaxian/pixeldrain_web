<script lang="ts">
export let toggle = false;
</script>

<button class="button small_button round"
	class:button_highlight={toggle}
	style="margin: 0;"
	on:click={() => toggle = !toggle}
>
	<i class="icon">help</i>
</button>

<style>
.button {
	flex: 0 0 content;
	background: none;
	color: var(--body_text_color);
	box-shadow: none;
}
</style>
