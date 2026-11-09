<script lang="ts">
let { toggle = $bindable(false) }: {
	toggle?: boolean;
} = $props();
</script>

<button class="button small_button round"
	class:button_highlight={toggle}
	style="margin: 0;"
	onclick={() => toggle = !toggle}
>
	<i class="icon i_help"></i>
</button>

<style>
.button {
	flex: 0 0 content;
	background: none;
	color: var(--body_text_color);
	box-shadow: none;
}
</style>
