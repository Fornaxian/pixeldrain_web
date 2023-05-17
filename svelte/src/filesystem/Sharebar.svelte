<script context="module">
export const generate_share_url = path => {
	let share_url = ""
	let bucket_idx = -1

	// Find the last node in the path that has a public ID
	for (let i = path.length-1; i >= 0; i--) {
		if (path[i].id !== undefined && path[i].id !== "me") {
			bucket_idx = i
			break
		}
	}
	if (bucket_idx !== -1) {
		share_url = window.location.protocol+"//"+
			window.location.host+"/d/"+
			path[bucket_idx].id

		// Construct the path starting from the bucket
		for (let i = bucket_idx+1; i < path.length; i++) {
			share_url += "/" + encodeURIComponent(path[i].name)
		}
	}

	return share_url
}
</script>

<script>
import { fs_update } from "./FilesystemAPI";

export let visible = false
export let share_url = ""
$: {
	if (share_url === "") {
		visible = false
	}
}

const share = async () => {
	console.debug("Making file sharable", state.base)
	try {
		await fs_update(state.root.id, state.base.path, {shared: true})
	} catch (err) {
		console.error(err)
		alert(err)
		return
	}

	fs_navigator.navigate(state.base.path, false)
}

export let state
export let fs_navigator

const share_email = () => {
	window.open(
		'mailto:please@set.address?subject=File%20on%20pixeldrain&body='+encodeURIComponent(share_url)
	);
}
const share_reddit = () => {
	window.open('https://www.reddit.com/submit?url='+encodeURIComponent(share_url));
}
const share_twitter = () => {
	window.open('https://twitter.com/share?url='+encodeURIComponent(share_url));
}
const share_facebook = () => {
	window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(share_url));
}
const share_tumblr = () => {
	window.open('http://www.tumblr.com/share/link?url='+encodeURIComponent(share_url));
}
</script>

<div class="sharebar" class:visible>
	{#if share_url !== ""}
		Share on:<br/>
		<button class="button_full_width" on:click={share_email}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path d="M22 4H2v16h20V4zm-2 4l-8 5-8-5V6l8 5 8-5v2z"/>
			</svg>
			<br/>
			E-Mail
		</button>
		<button class="button_full_width" on:click={share_reddit}>
			<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
				<path d="M22,12.14C22,10.92 21,9.96 19.81,9.96C19.22,9.96 18.68,10.19 18.29,10.57C16.79,9.5 14.72,8.79 12.43,8.7L13.43,4L16.7,4.71C16.73,5.53 17.41,6.19 18.25,6.19C19.11,6.19 19.81,5.5 19.81,4.63C19.81,3.77 19.11,3.08 18.25,3.08C17.65,3.08 17.11,3.43 16.86,3.95L13.22,3.18C13.11,3.16 13,3.18 12.93,3.24C12.84,3.29 12.79,3.38 12.77,3.5L11.66,8.72C9.33,8.79 7.23,9.5 5.71,10.58C5.32,10.21 4.78,10 4.19,10C2.97,10 2,10.96 2,12.16C2,13.06 2.54,13.81 3.29,14.15C3.25,14.37 3.24,14.58 3.24,14.81C3.24,18.18 7.16,20.93 12,20.93C16.84,20.93 20.76,18.2 20.76,14.81C20.76,14.6 20.75,14.37 20.71,14.15C21.46,13.81 22,13.04 22,12.14M7,13.7C7,12.84 7.68,12.14 8.54,12.14C9.4,12.14 10.1,12.84 10.1,13.7A1.56,1.56 0 0,1 8.54,15.26C7.68,15.28 7,14.56 7,13.7M15.71,17.84C14.63,18.92 12.59,19 12,19C11.39,19 9.35,18.9 8.29,17.84C8.13,17.68 8.13,17.43 8.29,17.27C8.45,17.11 8.7,17.11 8.86,17.27C9.54,17.95 11,18.18 12,18.18C13,18.18 14.47,17.95 15.14,17.27C15.3,17.11 15.55,17.11 15.71,17.27C15.85,17.43 15.85,17.68 15.71,17.84M15.42,15.28C14.56,15.28 13.86,14.58 13.86,13.72A1.56,1.56 0 0,1 15.42,12.16C16.28,12.16 17,12.86 17,13.72C17,14.56 16.28,15.28 15.42,15.28Z" />
			</svg>
			<br/>
			Reddit
		</button>
		<button class="button_full_width" on:click={share_twitter}>
			<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
				<path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
			</svg>
			<br/>
			Twitter
		</button>
		<button class="button_full_width" on:click={share_facebook}>
			<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
				<path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M18,5H15.5A3.5,3.5 0 0,0 12,8.5V11H10V14H12V21H15V14H18V11H15V9A1,1 0 0,1 16,8H18V5Z" />
			</svg>
			<br/>
			Facebook
		</button>
		<button class="button_full_width" on:click={share_tumblr}>
			<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="0 0 24 24">
				<path d="M17,11H13V15.5C13,16.44 13.28,17 14.5,17H17V21C17,21 15.54,21.05 14.17,21.05C10.8,21.05 9.5,19 9.5,16.75V11H7V7C10.07,6.74 10.27,4.5 10.5,3H13V7H17" />
			</svg>
			<br/>
			Tumblr
		</button>
	{:else}
		This file or directory is not currently shared. Would you like to make it sharable?
		<button on:click={share}>
			<i class="icon">share</i>
			Make sharable
		</button>
	{/if}
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
	background: var(--shaded_background);
	text-align: center;
	z-index: 48;
	overflow: hidden;
	opacity: 0;
	transition: left 0.3s, opacity 0.3s;
	border-top-left-radius: 16px;
	border-bottom-left-radius: 16px;
}
.visible {
	left: 8em;
	opacity: 1;
}
.button_full_width {
	width: calc(100% - 6px);
}
.button_full_width > svg {
	height: 3em;
	width: 3em;
	fill: currentColor;
}
</style>
