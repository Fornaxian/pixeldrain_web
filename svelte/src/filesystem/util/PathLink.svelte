<script lang="ts">
import type { FSNavigator } from "filesystem/FSNavigator";

export let nav: FSNavigator
export let path = ""
</script>

<a href={"/d"+path} on:click|preventDefault={() => {nav.navigate(path, true)}}>
	<slot></slot>
</a>
