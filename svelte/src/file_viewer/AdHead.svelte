<script context="module">
import { writable } from "svelte/store";
export const adsplus_load = writable(false)
export const adsplus_loaded = writable(false)
export const adaround_load = writable(false)
export const adaround_loaded = writable(false)
export const flyingsquare_load = writable(false)
export const flyingsquare_loaded = writable(false)
export const valueimpression_load = writable(false)
export const valueimpression_loaded = writable(false)

export const load_ad = (ad_type) => {
	if (ad_type === "ads.plus") {
		adsplus_load.set(true)
	} else if (ad_type === "adaround") {
		adaround_load.set(true)
	} else if (ad_type === "flyingsquare") {
		flyingsquare_load.set(true)
	} else if (ad_type === "valueimpression") {
		valueimpression_load.set(true)
	}
}
</script>

<script>
// This script makes sure that each head element is only loaded once. The _load
// stores are for telling this script to load a head element, and the _loaded
// stores are for telling the ads that the head element has finished loading

let adsplus = false
adsplus_load.subscribe(v => adsplus = v)
const adsplus_load_event = () => {
	adsplus_loaded.set(true)
	console.debug("finished loading adsplus head element")
}

let adaround = false
adaround_load.subscribe(v => adaround = v)
const adaround_load_event = () => {
	adaround_loaded.set(true)
	console.debug("finished loading adaround head element")
}

let flyingsquare = false
flyingsquare_load.subscribe(v => flyingsquare = v)
const flyingsquare_load_event = () => {
	flyingsquare_loaded.set(true)
	console.debug("finished loading flyingsquare head element")
}

let valueimpression = false
valueimpression_load.subscribe(v => valueimpression = v)
const valueimpression_load_event = () => {
	valueimpression_loaded.set(true)
	console.debug("finished loading valueimpression head element")
}
</script>

<svelte:head>
	{#if adsplus}
		<script on:load={adsplus_load_event} async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
	{/if}
	{#if adaround}
		<script on:load={adaround_load_event} async src="/res/script/adaround.js"></script>
	{/if}
	{#if flyingsquare}
		<script on:load={flyingsquare_load_event} async src="/res/script/flyingsquare.js"></script>
	{/if}
	{#if valueimpression}
		<script on:load={valueimpression_load_event} async defer src="//services.vlitag.com/adv1/?q=f8197b031408cd00d0ba7385af21bec5"></script>
		<script> var vitag = vitag || {};</script>
	{/if}
</svelte:head>
