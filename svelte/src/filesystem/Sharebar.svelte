<script>
let sharebar
export let visible = false
export const setVisible = (v) => { visible = v }
export const toggle = () => { setVisible(!visible) }
</script>

<div bind:this={sharebar} class="sharebar" class:visible>
	Share on:<br/>
	<button class="sharebar-button button_full_width" onclick="window.open('mailto:please@set.address?subject=File%20on%20pixeldrain&body=' + window.location.href);">
		E-Mail
	</button>
	<button class="sharebar-button button_full_width" onclick="window.open('https://www.reddit.com/submit?url=' + window.location.href);">
		Reddit
	</button>
	<button class="sharebar-button button_full_width" onclick="window.open('https://twitter.com/share?url=' + window.location.href);">
		Twitter
	</button>
	<button class="sharebar-button button_full_width" onclick="window.open('http://www.facebook.com/sharer.php?u=' + window.location.href);">
		Facebook
	</button>
	<button class="sharebar-button button_full_width" onclick="window.open('http://www.tumblr.com/share/link?url=' + window.location.href);">
		Tumblr
	</button>
</div>

<style>
.sharebar{
	position: absolute;
	width: 7em;
	left: -8em;
	bottom: 0;
	top: 0;
	overflow-y: scroll;
	overflow-x: hidden;
	float: left;
	background-color: var(--layer_1_color);
	box-shadow: inset 1px 1px var(--layer_1_shadow) var(--shadow_color);
	text-align: center;
	z-index: 48;
	overflow: hidden;
	transition: left 0.5s;
}
.visible { left: 8em; }
</style>
