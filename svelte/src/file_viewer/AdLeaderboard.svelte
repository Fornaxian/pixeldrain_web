<script>
import { onMount } from "svelte"
import { adsplus_load, adsplus_loaded, adaround_load, flyingsquare_load } from "./AdHead.svelte"

let container
let banner
let ad_type = ""

let set_ad_type = (t) => {
	ad_type = t
	if (ad_type === "ads.plus") {
		adsplus_load.set(true)
	} else if (ad_type === "adaround") {
		adaround_load.set(true)
	} else if (ad_type === "flyingsquare") {
		flyingsquare_load.set(true)
	}

	console.log("leaderboard ad is " + t)
}

onMount(() => {
	let url_ads = new URL(window.location.href).searchParams.get("ads")
	if (url_ads) {
		set_ad_type(url_ads)
		return
	}

	let now = new Date().getTime()
	switch (now % 5) {
		case 0:
			set_ad_type("aads")
			break
		case 1:
			set_ad_type("brave")
			break
		case 2:
			set_ad_type("ads.plus")
			break
		case 3:
			set_ad_type("adaround")
			break
		case 4:
			set_ad_type("flyingsquare")
			break
	}

	resize()
})

// We scale the size of the banner based on the size of the screen. But because
// some things don't scale easily like iframes and javascript ads we use a CSS
// transformation instead of changing the actual dimensions
const resize = () => {
	if (!banner) {
		return
	}

	let scaleWidth = 1
	let scaleHeight = 1
	let minWindowHeight = 600
	let bannerWidth = banner.offsetWidth
	let bannerHeight = banner.offsetHeight

	if (window.innerWidth < bannerWidth) {
		scaleWidth = window.innerWidth / bannerWidth
	}
	if (window.innerHeight < minWindowHeight) {
		scaleHeight = window.innerHeight / minWindowHeight
	}

	// The smaller scale is the scale we'll use
	let scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight

	// Because of the scale transformation the automatic margins don't work
	// anymore. So we have to manually calculate the margin. Here we take the
	// width of the viewport - the width of the ad to calculate the amount of
	// pixels around the ad. We multiply the ad size by the scale we calculated
	// to account for the smaller size.
	let offset = (window.innerWidth - (bannerWidth * scale)) / 2

	container.style.height = (bannerHeight * scale) + "px"
	banner.style.marginLeft = offset + "px"
	banner.style.transform = "scale(" + scale + ")"
}

adsplus_loaded.subscribe(v => {
	if (v) {
		window.googletag = window.googletag || {cmd: []};
		googletag.cmd.push(function() {
			googletag.defineSlot('/21673142571/299__pixeldrain.com__default__728x90_1', [728, 90], 'div-gpt-ad-pixeldraincom728x90_1').addService(googletag.pubads());
			googletag.pubads().collapseEmptyDivs();
			googletag.enableServices();
		});
		googletag.cmd.push(function() { googletag.display('div-gpt-ad-pixeldraincom728x90_1'); });
	}
})
</script>

<svelte:window on:resize={resize} on:load={resize}/>

<div bind:this={container}>
	{#if ad_type === "publisherrest_1"}
		<div style="text-align: center; line-height: 1.4em; font-size: 22px;">
			<a href="https://pixeldrain.com/vouchercodes/" class="button button_highlight" style="margin: 8px;">
				<i class="icon">shopping_cart</i>
				Click here for online shopping discounts!
				<i class="icon">shopping_cart</i>
			</a>
		</div>
	{:else if ad_type === "publisherrest_2"}
		<div style="text-align: center; line-height: 1.4em; font-size: 22px;">
			<a href="https://pixeldrain.com/vouchercodes/" class="button button_highlight" style="margin: 8px;">
				<i class="icon">shopping_cart</i>
				Check our online shopping discounts!
				<i class="icon">shopping_cart</i>
			</a>
		</div>
	{:else if ad_type === "publisherrest_3"}
		<div style="text-align: center; line-height: 1.4em; font-size: 22px;">
			<a href="https://pixeldrain.com/vouchercodes/" class="button button_highlight" style="margin: 8px;">
				<i class="icon">shopping_cart</i>
				Free coupon codes for online shopping!
				<i class="icon">shopping_cart</i>
			</a>
		</div>
	{:else if ad_type === "aads"}
		<iframe bind:this={banner} class="banner"
			data-aa="73974"
			src="//ad.a-ads.com/73974?size=728x90&background_color={window.style.layer2Color}&text_color={window.style.textColor}&title_color={window.style.highlightColor}&title_hover_color={window.style.highlightColor}&link_color={window.style.highlightColor}&link_hover_color={window.style.highlightColor}"
			style="width:728px; height:90px; border:0px; padding:0; overflow:hidden; background-color: transparent;"
			title="A-ads advertisement">
		</iframe>
	{:else if ad_type === "brave"}
		<a bind:this={banner} class="banner" style="display: inline-block; width: 728px; height: 90px;" href="/click/MdUXxSov?target=https%3A%2F%2Fbrave.com%2Fpix009">
			<img src="/res/img/misc/brave-728x90.png" style="width: 100%; height: 100%" alt="Brave ad"/>
		</a>
	{:else if ad_type === "ads.plus"}
		<!-- This is the tag for the unit and should be placed in the respective ad spot in the body part of the page -->
		<!-- /21673142571/299__pixeldrain.com__default__728x90_1 -->
		<div bind:this={banner} class="banner" id='div-gpt-ad-pixeldraincom728x90_1' style='width: 728px; height: 90px;'>
		</div>
	{:else if ad_type === "pixfuture"}
		<!-- AuctionX Display platform tag START -->
		<div bind:this={banner} class="banner" id="27517x728x90x4605x_ADSLOT1" clickTrack="%%CLICK_URL_ESC%%" style="display: block; margin: auto;"></div>
		<script type="text/javascript" async src="https://served-by.pixfuture.com/www/delivery/headerbid.js" slotId="27517x728x90x4605x_ADSLOT1" refreshTime="5" refreshInterval="60"></script>
		<!-- AuctionX Display platform tag END -->
	{:else if ad_type === "adaround"}
		<div bind:this={banner} class="_fa7cdd4c68507744 banner" data-zone="d8764be36c134d3d807abb2a073dc010" style="width:728px;height:90px;display: inline-block;margin: 0 auto"></div>
	{:else if ad_type === "flyingsquare"}
		<div bind:this={banner} class="xc449bad4854773ff banner" data-zone="28ebf286bb7d4446a5ba43b0ead8f1bb" style="width:728px;height:90px;display: inline-block;margin: 0 auto"></div>
	{/if}
</div>

<style>
.banner {
	display: block;
	margin: auto;
	transform-origin: 0 0;
}
</style>
