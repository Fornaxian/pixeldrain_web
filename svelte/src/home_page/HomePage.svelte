<script>
import Menu from "filesystem/Menu.svelte";
import Footer from "layout/Footer.svelte";
import { drop_target } from "lib/DropTarget";
import AddressReputation from "./AddressReputation.svelte";
import FeatureTable from "./FeatureTable.svelte";
import GetStarted from "./GetStarted.svelte";
import UploadWidget from "./UploadWidget.svelte";
import PrepaidPricing from "./PrepaidPricing.svelte";
import Map from "icons/Map.svelte";

let upload_widget = $state()
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
				<span class="feature_header">
					Fast and efficient cloud storage
				</span>
				<br/>
				<span>
					Pixeldrain is built for performance, we don't like to keep
					you waiting
				</span>
			</p>
			<p>
				<span class="feature_header">
					We take privacy seriously
				</span>
				<br/>
				<span>
					There are no trackers or advertisements on our website
				</span>
			</p>
			<p>
				<span class="feature_header">
					Customizable
				</span>
				<br/>
				<span>
					Make pixeldrain look the way you want it
				</span>
			</p>
			<p>
				<span class="feature_header">
					1600 Gbps bandwidth capacity
				</span>
				<br/>
				<span>
					We have caching servers in seven different locations
					worldwide. This makes sure the website is always snappy for
					you
				</span>
			</p>
			<p>
				<span class="feature_header">
					Highly optimized servers
				</span>
				<br/>
				<span>
					Our global server fleet is optimized for long-distance file
					transfers. This makes sure you can always reach maximum
					bandwidth capacity
				</span>
			</p>
		</section>
	{/if}
</div>

<Map/>

<header id="pro">
	<h1>Subscription plans</h1>
</header>
<div class="page_content">
	<FeatureTable/>
</div>

<header>
	<h1>Prepaid plan</h1>
</header>
<div class="page_content">
	<PrepaidPricing/>
</div>

<header>
	<h1>Get started</h1>
</header>
<GetStarted/>

<Footer nobg/>

<style>
.logo_header {
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
header > h1 {
	margin-top: 30px;
	margin-bottom: 30px;
}

.feature_header {
	font-weight: bold;
	color: var(--highlight_color);
	text-shadow: 1px 1px 0px var(--shadow_color);
}

.header_image_container {
	text-align: initial;
	margin: auto;
	margin-bottom: 1.5em; /*Offset for menu button*/
	height: 200px;
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
.drop_target {
	border-radius: 8px;
}
</style>
