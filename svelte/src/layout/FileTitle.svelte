<script lang="ts">
let { title = "" }: {
	title?: string;
} = $props();
</script>

<h1>{title}</h1>

<style>
h1 {
	text-shadow: 1px 1px 2px #000000;
	line-break: anywhere;
}
</style>
