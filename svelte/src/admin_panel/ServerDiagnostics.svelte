<script>
import { createEventDispatcher, onMount } from "svelte";
import { formatDuration } from "util/Formatting";
let dispatch = createEventDispatcher()

export let running_since = ""

$: profile_running = running_since != "0001-01-01T00:00:00Z" && running_since != ""

const start = async () => {
	if (!profile_running) {
		const resp = await fetch(
			window.api_endpoint+"/admin/cpu_profile",
			{ method: "POST" }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} else {
		window.open(window.api_endpoint+"/admin/cpu_profile")
	}

	dispatch("refresh")
}

let interval
let running_time = "0s"
onMount(() => {
	interval = setInterval(() => {
		if (profile_running) {
			running_time = formatDuration(
				(new Date()).getTime() - Date.parse(running_since),
			)
		}
	}, 1000)

	return () => {
		clearInterval(interval)
	}
})

</script>

<a class="button" href="/api/admin/call_stack">Call stack</a>
<a class="button" href="/api/admin/heap_profile">Heap profile</a>
<button on:click={start} class:button_red={profile_running}>
	{#if profile_running}
		Stop CPU profiling (running for {running_time})
	{:else}
		Start CPU profiling
	{/if}
</button>
