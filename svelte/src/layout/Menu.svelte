<script lang="ts">
import { user } from "lib/UserStore";

let nav: HTMLElement;

export const toggle = () => {
	var body = document.getElementById("page_body");
	if (nav.offsetLeft === 0) {
		// Menu is visible, hide it
		nav.style.left = -nav.offsetWidth + "px";
		body.style.marginLeft = "0";
	} else {
		// Menu is hidden, show it
		nav.style.left = "0";
		body.style.marginLeft = nav.offsetWidth + "px";
	}
}
export const reset = () => {
	nav.style.left = "";
	document.getElementById("page_body").style.marginLeft = "";
}
</script>

<button id="button_toggle_navigation" class="button_toggle_navigation" on:click={toggle}>☰</button>
<nav bind:this={nav} id="page_navigation" class="page_navigation">
	<a href="/#">Home</a>
	<a href="/#prepaid">For Creators</a>
	<hr />
	{#if $user.username !== ""}
		<a href="/user">{$user.username}</a>
		<a href="/user/filemanager#files">My Files</a>
		<a href="/user/filemanager#lists">My Albums</a>
		{#if $user.is_admin}
			<a href="/user/buckets">Buckets</a>
			<a href="/admin">Admin Panel</a>
		{/if}
		<a href="/logout">Log out</a>
	{:else}
		<a href="/login">Login</a>
		<a href="/register">Register</a>
		<a href="/history">Upload History</a>
	{/if}
	<hr />
	<a href="/about">About</a>
	<a href="/apps">Apps</a>
	<a href="/appearance">Theme</a>
	<a href="/api">API</a>
	<a href="/acknowledgements">Acknowledgements</a>
	<a href="https://stats.uptimerobot.com/p9v2ktzyjm" target="_blank">Server Status</a>
</nav>

<style>
.button_toggle_navigation {
	position: fixed;
	backface-visibility: hidden;
	z-index: 10;
	top: 0;
	left: 0;
	padding: 10px 20px 15px 10px;
	font-size: 2em;
	margin: 0;
	background: #3f3f3f;
	background: var(--input_background);
	border-radius: 0;
	border-bottom-right-radius: 90%;
}

.button_toggle_navigation:active {
	padding: 15px 15px 10px 15px;
}

.page_navigation {
	position: fixed;
	backface-visibility: hidden;
	background: var(--navigation_background);
	width: 17em;
	height: 100%;
	left: 0;
	float: left;
	padding: 20px 10px 10px 0;
	overflow-y: auto;
	overflow-x: hidden;
	text-align: left;
	transition: left 0.5s;
}
</style>
