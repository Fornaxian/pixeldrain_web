<script>
import { createEventDispatcher, onMount, tick } from "svelte"
import { color_by_name_no_prefix } from "../util/Util.svelte";
import * as head from "./AdHead.svelte"

let dispatch = createEventDispatcher()
let container
let ad_type = ""
let visible = false

onMount(() => {
	let url_ads = new URL(window.location.href).searchParams.get("ads")
	if (url_ads) {
		set_ad_type(url_ads)
		return
	}

	if (document.body.clientWidth < 700) {
		visible = false
		dispatch("visibility", false)
		return
	}

	// If the ad popup was dismissed less than 24 hours ago we don't show it
	let dismissal = +localStorage.getItem("viewer_skyscraper_ad_dismissed")
	let now = new Date().getTime()

	if (dismissal > 0 && now - dismissal < 1000 * 60 * 60 * 24) {
		console.log("Skyscraper dismissed")
		visible = false
		dispatch("visibility", false)
		return
	}

	switch (Math.floor(Math.random()*2)) {
		case 0:
			set_ad_type("ads.plus")
			break
		case 1:
			set_ad_type("pixfuture")
			break
	}
})

let set_ad_type = async t => {
	ad_type = t
	head.load_ad(t)

	visible = true
	await tick()
	dispatch("visibility", true)
	container.style.right = "0"

	console.log("skyscraper ad is " + t)
}

const close = () => {
	container.style.right = -container.offsetWidth + "px"
	dispatch("visibility", false)

	localStorage.setItem("viewer_skyscraper_ad_dismissed", new Date().getTime())

	// Remove the ad from the DOM to save memory
	setTimeout(() => { visible = false }, 1000)
}

head.adsplus_loaded.subscribe(v => {
	if (v) {
		window.googletag = window.googletag || {cmd: []};
		googletag.cmd.push(function() {
			googletag.defineSlot('/21673142571/299__pixeldrain.com__default__160x600_1', [160, 600], 'div-gpt-ad-pixeldraincom160x600_1').addService(googletag.pubads());
			googletag.pubads().collapseEmptyDivs();
			googletag.enableServices();
		});
		googletag.cmd.push(function() { googletag.display('div-gpt-ad-pixeldraincom160x600_1'); });
	}
})
head.valueimpression_loaded.subscribe(v => {
	if (v) {
		(vitag.Init = window.vitag.Init || []).push(function(){viAPItag.display("vi_1994884988")})
	}
})

</script>

{#if visible}
	<div class="skyscraper" bind:this={container}>
		<button on:click={close} class="round">
			<i class="icon">close</i> Close ad
		</button>
		<div class="ad_space">
			{#if ad_type === "aads"}
				<iframe
					data-aa="1811738"
					src="//ad.a-ads.com/1811738?size=160x600&background_color={color_by_name_no_prefix('body_color')}&text_color={color_by_name_no_prefix('body_text_color')}&title_color={color_by_name_no_prefix('highlight_color')}&title_hover_color={color_by_name_no_prefix('highlight_color')}&link_color={color_by_name_no_prefix('highlight_color')}&link_hover_color={color_by_name_no_prefix('highlight_color')}"
					style="width:160px; height:600px; border:0px; padding:0; overflow:hidden; background-color: transparent;"
					title="A-ads advertisement">
				</iframe>
			{:else if ad_type === "ads.plus"}
				<!-- /21673142571/299__pixeldrain.com__default__160x600_1 -->
				<div id='div-gpt-ad-pixeldraincom160x600_1' style='width: 160px; height: 600px;'></div>
			{:else if ad_type === "pixfuture"}
				<!-- AuctionX Display platform tag START -->
				<div id="27513x160x600x4605x_ADSLOT1" clickTrack="%%CLICK_URL_ESC%%" style="display: block; margin: auto;"></div>
				<script type="text/javascript" async src="https://served-by.pixfuture.com/www/delivery/headerbid.js" slotId="27513x160x600x4605x_ADSLOT1" refreshTime="5" refreshInterval="60"></script>
				<!-- AuctionX Display platform tag END -->
			{:else if ad_type === "adaround"}
				<div class="_fa7cdd4c68507744" data-zone="2a0dbd4b7c484e9e824d211a57fa6b93" style="width:160px;height:600px;display: inline-block;margin: 0 auto"></div>
			{:else if ad_type === "flyingsquare"}
				<div class="xc449bad4854773ff" data-zone="d675792db61d408287d0d694d03d12e5" style="width:160px;height:600px;display: inline-block;margin: 0 auto"></div>
			{:else if ad_type === "valueimpression"}
				<div class="adsbyvli" data-ad-slot="vi_1994884988" style="width: 160px; height: 600px"></div>
			{/if}
		</div>
	</div>
{/if}

<style>
.skyscraper {
	position: absolute;
	width: 160px;
	z-index: 49;
	overflow: hidden;
	right: -160px;
	bottom: 0;
	top: 0;
	padding: 0;
	text-align: center;
	transition: right 0.5s;
}
.ad_space {
	width: 100%;
	height: 100%;
}
</style>
