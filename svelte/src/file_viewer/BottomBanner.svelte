<script>
import { onMount } from "svelte"

let ad_type = ""

onMount(() => {
	// 20% pixeldrain socials
	// 20% reviews
	// 10% battle cry
	// 40% patreon

	let rand = Math.random()
	if (rand < 0.2) {
		ad_type = "socials"
	} else if (rand < 0.4) {
		ad_type = "reviews"
	} else if (rand < 0.5) {
		ad_type = "slava_ukraini"
	} else {
		ad_type = "patreon_support"
	}
})
</script>

{#if ad_type === "patreon_support"}

	<div class="banner support_banner">
		<span style="display: block; margin-bottom: 2px;">
			No ads today. Pixeldrain is currently funded by our subscribers!
		</span>
		<a href="/#pro" rel="noreferrer" class="button button_highlight" target="_blank">
			<i class="icon">bolt</i>
			Support Pixeldrain to help keep the project going
		</a>
	</div>

{:else if ad_type === "socials"}

	<div class="banner center">
		<div class="socials">
			Pixeldrain is on the fediverse!<br/>

			<a href="https://mastodon.social/@fornax" rel="noreferrer" class="button" target="_blank" style="background-color: #595aff; color: #ffffff;">
				<i class="icon small">people</i>
				Mastodon
			</a>
			<a href="https://lemmy.fornaxian.tech/c/pixeldrain"
				rel="noreferrer" class="button" target="_blank" style="background-color: #14854f; color: #ffffff;"
			>
				<i class="icon small">people</i>
				Lemmy
			</a>
		</div>

		<div class="socials">
			And on legacy media too<br/>

			<a href="https://twitter.com/Fornax96" rel="noreferrer" class="button" target="_blank" style="background-color: #1a8cd8; color: #ffffff;">
				<i class="icon small">people</i>
				Twitter
			</a>
			<a href="https://www.reddit.com/r/PixelDrain"
				rel="noreferrer" class="button" target="_blank" style="background-color: #ff4500; color: #ffffff;"
			>
				<i class="icon small">people</i>
				Reddit
			</a>
		</div>
	</div>

{:else if ad_type === "reviews"}

	<div class="banner support_banner">
		<span style="display: block; margin-bottom: 2px;">
			Are you liking pixeldrain? Write a review! It really helps
		</span>
		<a href="https://alternativeto.net/software/pixeldrain/about/"
			rel="noreferrer" class="button" target="_blank" style="background-color: #0C9EF0; color: #FFFFFF; font-weight: bold;"
		>
			<i class="icon">rate_review</i>
			AlternativeTo
		</a>
		<a href="https://www.trustpilot.com/review/pixeldrain.com"
			rel="noreferrer" class="button" target="_blank" style="background-color: #00B67A; color: #FFFFFF; font-weight: bold;"
		>
			<i class="icon">rate_review</i>
			Trustpilot
		</a>
	</div>

{:else if ad_type === "slava_ukraini"}

	<a href="https://en.wikipedia.org/wiki/War_crimes_in_the_Russian_invasion_of_Ukraine" class="banner flag" target="_blank" rel="noreferrer">
		<div class="flag_top">
			We do not forget
		</div>
		<div class="flag_bottom">
			Slava Ukraini!
		</div>
	</a>

{/if}

<style>
.banner {
	display: block;
	margin: auto;
	transform-origin: 0 0;
	font-size: 1.2em;
}
.center {
	text-align: center;
}
.support_banner {
	text-align: center;
	padding: 2px;
}
.socials {
	display: inline-block;
	text-align: center;
	margin: 0 5px;
}

/* Try to avoid text wrapping */
@media(max-width: 600px) {
	.banner {
		font-size: 1em;
	}
	.socials {
		font-size: 0.8em;
	}
}

.flag {
	display: block;
	margin: auto;
	padding: 4px;
	overflow: hidden;
	text-decoration: none;
	text-align: center;
	font-size: 1.1em;
	width: 100%;
	max-width: 400px;
}
.flag_top {
	background-color: #0057b7;
	color: #ffd700;
	padding: 2px;
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
}
.flag_bottom {
	background-color: #ffd700;
	color: #0057b7;
	padding: 2px;
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
}
</style>
