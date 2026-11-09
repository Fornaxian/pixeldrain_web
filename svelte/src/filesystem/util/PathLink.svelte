<script lang="ts">
import type { FSNavigator } from "filesystem/FSNavigator";

let { nav, path = "", children }: {
	nav: FSNavigator;
	path?: string;
	children?: import('svelte').Snippet;
} = $props();
</script>

<a href={"/d"+path} onclick={e => {e.preventDefault(); nav.navigate(path, true)}}>
	{@render children?.()}
</a>
