<script>
import PixeldrainLogo from "../util/PixeldrainLogo.svelte";
export let embedded_viewer = false
</script>

{#if window.user.username === ""}
	<a
		href="/"
		class="button button_home round"
		target={embedded_viewer ? "_blank" : ""}
		title="Go to the pixeldrain home page">
		<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0 4px 0 0;"></PixeldrainLogo>
	</a>
{:else}
	<a
		href="/user"
		class="button round"
		target={embedded_viewer ? "_blank" : ""}
		title="My account">
		<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0;"></PixeldrainLogo>
		<span class="username">
			{window.user.username}
		</span>
	</a>
{/if}

<style>
.button_home::after {
	content: "pixeldrain";
}

@media (max-width: 600px) {
	.button_home::after {
		content: "pd";
	}

	.username {
		display: none;
	}
}
</style>
