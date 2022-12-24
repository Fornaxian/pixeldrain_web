<script>
    import Github from "../icons/Github.svelte";
    import Mastodon from "../icons/Mastodon.svelte";
import Patreon from "../icons/Patreon.svelte";
import Reddit from "../icons/Reddit.svelte";
import Twitter from "../icons/Twitter.svelte";
</script>

<footer>
	<div class="footer_content">
		<div style="display: inline-block; margin: 0 8px;">
			Pixeldrain is a product by
			<a href="//fornaxian.tech" target="_blank" rel="noreferrer">Fornaxian Technologies</a>
		</div>
		<div style="display: inline-block; margin: 0 8px;">
			<a href="https://www.patreon.com/pixeldrain" target="_blank" rel="noreferrer">
				<Patreon style="color: var(--body_text_color);"/> Patreon
			</a> |
			<a href="https://twitter.com/Fornax96" target="_blank" rel="noreferrer">
				<Twitter style="color: var(--body_text_color);"/> Twitter
			</a> |
			<a href="https://reddit.com/r/pixeldrain" target="_blank" rel="noreferrer">
				<Reddit style="color: var(--body_text_color);"/> Reddit
			</a> |
			<a href="https://github.com/Fornaxian" target="_blank" rel="noreferrer">
				<Github style="color: var(--body_text_color);"/> GitHub
			</a> |
			<a href="https://mastodon.social/web/@fornax" target="_blank" rel="noreferrer">
				<Mastodon style="color: var(--body_text_color);"/> Mastodon
			</a>
		</div>
		<br/>
		<span class="small_footer_text" style="font-size: .75em; line-height: .75em;">
			page rendered by {window.server_hostname}
		</span>
	</div>
</footer>

<style>
.footer_content {
	background-color: var(--body_background);
	color: var(--body_text_color);
	display: inline-block;
	border-radius: 8px;
	margin: 160px 0 60px 0;
}
</style>
