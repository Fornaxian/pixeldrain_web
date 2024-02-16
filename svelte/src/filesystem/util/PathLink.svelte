<script>
export let nav
export let path = ""
</script>

<a href={"/d"+path} on:click|preventDefault={() => {nav.navigate(path, true)}}>
	<slot></slot>
</a>
