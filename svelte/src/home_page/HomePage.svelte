<script>
import Menu from "../filesystem/Menu.svelte";
import Footer from "../layout/Footer.svelte";
import { drop_target } from "../lib/DropTarget";
import AddressReputation from "./AddressReputation.svelte";
import FeatureTable from "./FeatureTable.svelte";
import GetStarted from "./GetStarted.svelte";
import UploadWidget from "./UploadWidget.svelte";

let upload_widget
</script>

<header class="logo_header">
	<div class="menu_button_container">
		<Menu no_login_label="Not logged in" hide_name={false} hide_logo style="border-radius: 0 0 0 8px; margin: 0"/>
	</div>
	<div class="header_image_container"></div>
</header>

<AddressReputation/>

<div class="page_content">
	{#if window.user && window.user.username && window.user.username !== ""}
		<div
			class="drop_target"
			use:drop_target={{
				upload: (files) => upload_widget.upload_files(files),
				shadow: "var(--highlight_color) 0 0 10px 2px inset",
			}}
		>
			<UploadWidget bind:this={upload_widget}/>
		</div>
	{:else}
		<section>
			<p>
				Pixeldrain offers services for efficiently moving and storing
				digital files on the internet.
			</p>
			<h2>What pixeldrain is good at</h2>
			<ul>
				<li>
					Serving large files to millions of people worldwide
				</li>
				<li>
					Storing files for less money than all the competition
				</li>
			</ul>
			<h2>Things we take very seriously</h2>
			<ul>
				<li>
					<b>Performance</b> - Slow software is a waste of time. We
					don't want to make you wait, so pixeldrain is completely
					tuned for maximum performance
				</li>
				<li>
					<b>Privacy</b> - There is too much tracking on the web
					nowadays. Pixeldrain goes in the other direction, this site
					does not contain any advertisements or third party tracking
					scripts. We don't even require you to enter an e-mail
					address to register an account
				</li>
				<li>
					Bullet lists
				</li>
			</ul>
		</section>
	{/if}
</div>

<header>
	<h1>Pricing</h1>
	<span>(Prepaid plan. For monthly subscriptions, look further below)</span>
</header>
<div class="page_content">
	<section>
		<div class="prices">
			<div>
				<div>Storage pricing</div>
				<div>€ 4 / TB / month</div>
			</div>
			<div>
				<div>Egress pricing</div>
				<div>€ 2 / TB</div>
			</div>
			<div>
				<div>That's it!</div>
				<div>No other charges</div>
			</div>
		</div>

		<h2>What you get</h2>
		<ul>
			<li>
				<span class="bold">Unlimited</span> storage space
			</li>
			<li>
				Cloud storage with <a href="/filesystem#toc_7">rclone</a> and <a
				href="/filesystem#toc_10">FTPS</a> support
			</li>
			<li>
				<span class="bold">Customizable</span> download pages (custom
				branding colours, header and background images)
			</li>
			<li>
				<span class="bold">Fault tolerance</span> for up to four storage
				server failures
			</li>
			<li>
				Total bandwidth capacity of <span class="bold">900
				Gigabits</span> per second
			</li>
			<li>
				Nine high-performance caching servers optimized for data
				transfer over long distances
			</li>
			<li>
				File caching in
				<span class="bold">Frankfurt</span>,
				<span class="bold">Singapore</span> and
				<span class="bold">Portland</span>
			</li>
		</ul>
		<img class="image" src="/res/img/map.webp" alt="A globe showing datacenter locations"/>
		<h3>What you don't get</h3>
		<ul>
			<li>
				Data backups - Please keep a local copy of everything you store
				in case of emergency
			</li>
			<li>
				Commercial support - If you have a question, please check the <a
				href="/about">Q&A page</a> first. If that doesn't answer it, try
				the <a href="https://discord.gg/UDjaBGwr4p"
				target="_blank">support channel</a> on Discord.
			</li>
		</ul>
	</section>
</div>

<header>
	<h1>Get started</h1>
</header>
<GetStarted/>

<header id="pro">
	<h1>Premium plans</h1>
</header>
<div class="page_content">
	<FeatureTable/>
</div>

<Footer nobg/>

<style>
:global(.page_body) {
	background-image: url("/res/img/inflating_star.webp");
	background-repeat: no-repeat;
	background-attachment: fixed;
	background-position: center;
	background-size: cover;
}
.page_content {
	margin-top: 16px;
	margin-bottom: 16px;
}
@media (max-width: 1100px) {
	.page_content {
		margin-top: 0;
	}
}

header {
	padding-top: 20px;
	padding-bottom: 20px;
}
.logo_header {
	text-align: initial;
	padding-top: 0;
	padding-bottom: 0;
}
header > h1,
header > span {
	color: #ffffff;
	text-shadow: 0 0 4px #000000;
	margin-top: 30px;
	margin-bottom: 30px;
}

.header_image_container {
	text-align: initial;
	margin: auto;
	margin-bottom: 1.5em; /*Offset for menu button*/
	height: 150px;
	width: 500px;
	max-width: 100%;
	background-image: url("/res/img/header_orbitron.webp");
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}
.menu_button_container {
	display: flex;
	justify-content: end;
}
.image {
	max-width: 100%;
	border-radius: 12px;
}
.drop_target {
	border-radius: 8px;
}
.bold {
	font-weight: bold;
	color: var(--highlight_color);
	text-shadow: 1px 1px 3px var(--shadow_color);
}

.prices {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	gap: 10px;
}
.prices > div {
	flex: 1 0 200px;
	min-width: 200px;
	display: flex;
	flex-direction: column;
	text-align: center;
	border-radius: 6px;
	overflow: hidden;
	border: 2px solid var(--card_color);
}
.prices > div > div {
	padding: 4px;
}
.prices > div > div:nth-child(2) {
	background: var(--card_color);
	font-size: 1.3em;
}
</style>
