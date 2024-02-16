<script>
import PixeldrainLogo from "../util/PixeldrainLogo.svelte";
export let embedded_viewer = false
export let nobg = false
</script>

{#if window.user.username === ""}
	<a
		href="/"
		class="button button_home round"
		class:nobg
		target={embedded_viewer ? "_blank" : ""}
		title="Go to the pixeldrain home page">
		<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0;"></PixeldrainLogo>
		<span class="label"></span>
	</a>
{:else}
	<a
		href="/user"
		class="button round"
		class:nobg
		target={embedded_viewer ? "_blank" : ""}
		title="My account">
		<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0;"></PixeldrainLogo>
		<span class="username">
			{window.user.username}
		</span>
	</a>
{/if}

<style>
.button {
	flex: 0 0 content;
}
.label::after {
	content: "pixeldrain";
}

.nobg {
	background: none;
	margin: 0;
	color: var(--body_text_color);
	box-shadow: none;
}

@media (max-width: 600px) {
	.label::after {
		content: "pd";
	}

	.username {
		display: none;
	}
}
</style>
