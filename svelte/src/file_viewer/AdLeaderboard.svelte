<script>
import { onMount } from "svelte"
import { color_by_name_no_prefix } from "../util/Util.svelte";
import * as head from "./AdHead.svelte"

let container
let banner
let ad_type = ""

onMount(() => {
	let url_ads = new URL(window.location.href).searchParams.get("ads")
	if (url_ads) {
		set_ad_type(url_ads)
		return
	}

	// 10% pixeldrain socials
	// 90% patreon

	let rand = Math.random()
	if (rand < 0.1) {
		set_ad_type("pixeldrain_social")
	} else {
		set_ad_type("pixeldrain_patreon")
	}
})

let set_ad_type = async t => {
	ad_type = t
	head.load_ad(t)
	resize()

	console.log("leaderboard ad is " + t)
}

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

head.adsplus_loaded.subscribe(v => {
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
head.valueimpression_loaded.subscribe(v => {
	if (v) {
		(vitag.Init = window.vitag.Init || []).push(function(){viAPItag.display("vi_1994884987")})
	}
})
</script>

<svelte:window on:resize={resize} on:load={resize}/>

<svelte:head>
	{#if ad_type === "nextmillennium"}
		<script async src="https://powerad.ai/script.js"></script>
	{/if}
</svelte:head>

<div bind:this={container}>
	{#if ad_type === "aads"}
		<iframe bind:this={banner} class="banner"
			data-aa="73974"
			src="//ad.a-ads.com/73974?size=728x90&background_color={color_by_name_no_prefix('body_color')}&text_color={color_by_name_no_prefix('body_text_color')}&title_color={color_by_name_no_prefix('highlight_color')}&title_hover_color={color_by_name_no_prefix('highlight_color')}&link_color={color_by_name_no_prefix('highlight_color')}&link_hover_color={color_by_name_no_prefix('highlight_color')}"
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
		<!-- We don't bind the pixfuture ad to the banner variable because pixfuture does its own scaling -->
		<!-- AuctionX Display platform tag START -->
		<div class="banner" id="27517x728x90x4605x_ADSLOT1" clickTrack="%%CLICK_URL_ESC%%"></div>
		<script type="text/javascript" async src="https://served-by.pixfuture.com/www/delivery/headerbid.js" slotId="27517x728x90x4605x_ADSLOT1" refreshTime="5" refreshInterval="60"></script>
		<!-- AuctionX Display platform tag END -->
	{:else if ad_type === "adaround"}
		<div bind:this={banner} class="_fa7cdd4c68507744 banner" data-zone="d8764be36c134d3d807abb2a073dc010" style="width:728px;height:90px;display: inline-block;margin: 0 auto"></div>
	{:else if ad_type === "flyingsquare"}
		<div bind:this={banner} class="xc449bad4854773ff banner" data-zone="28ebf286bb7d4446a5ba43b0ead8f1bb" style="width:728px;height:90px;display: inline-block;margin: 0 auto"></div>
	{:else if ad_type === "valueimpression"}
		<!-- Valueimpression overrides the style of its div after loading,
			messing up our scaling script, so we wrap it in another div of the
			correct size -->
		<div bind:this={banner} class="banner" style="width: 728px; height: 90px; overflow: hidden;">
			<div class="adsbyvli" data-ad-slot="vi_1994884987" style="width: 728px; height: 90px"></div>
		</div>
	{:else if ad_type === "nextmillennium"}

		<div bind:this={banner} class="banner" style="width: 728px; height: 90px;"></div>

	{:else if ad_type === "pixeldrain_social"}

		<map name="socials_map">
			<area target="_blank" alt="Pixeldrain on Reddit" title="Pixeldrain on Reddit" href="https://reddit.com/r/pixeldrain" coords="0,38,364,90" shape="rect">
			<area target="_blank" alt="Pixeldrain on Twitter" title="Pixeldrain on Twitter" href="https://twitter.com/Fornax96" coords="364,38,728,90" shape="rect">
		</map>
		<img bind:this={banner} usemap="#socials_map" class="banner" src="/res/img/advertising/pixeldrain_socials.webp" style="display: inline-block; width: 728px; height: 90px;" alt="Pixeldrain social media"/>

	{:else if ad_type === "pixeldrain_patreon"}
		<div class="banner highlight_green" style="font-size: 1.1em; border-radius: 0;">
			<span style="display: block; margin-bottom: 2px;">
				No ads today. Pixeldrain is currently funded by our subscribers!
			</span>
			<a href="https://www.patreon.com/join/pixeldrain" rel="noreferrer" class="button button_highlight" target="_blank">
				<i class="icon">bolt</i>
				Support Pixeldrain to help keep the project going
			</a>
		</div>
	{/if}
</div>

<style>
.banner {
	display: block;
	margin: auto;
	transform-origin: 0 0;
}
</style>
