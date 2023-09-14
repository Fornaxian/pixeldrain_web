<script>
import Footer from "../layout/Footer.svelte";
import AddressReputation from "./AddressReputation.svelte";
import FeatureTable from "./FeatureTable.svelte";
import ForCreators from "./ForCreators.svelte";
import OtherPlans from "./OtherPlans.svelte";
import UploadWidget from "./UploadWidget.svelte";
</script>

<div class="page_content">
	<header>
		<div class="header_image_container"></div>
	</header>

	<AddressReputation/>

	<UploadWidget></UploadWidget>
</div>

<div class="page_content">
	<header>
		<h1>What is pixeldrain?</h1>
	</header>

	<section>
		<p>
			Pixeldrain is a file sharing website built for speed and ease of
			use. You can upload files you want to share online to our servers
			and we will hold on to them for at least two months. During this
			time anyone with the link will be able to download your files.
			Pixeldrain is built to be as fast as possible, so you don't have to
			do any unnecessary waiting when downloading files.
		</p>
		<p>
			Files can be uploaded by clicking the big green upload button, or by
			dragging them onto this page from your file manager.
		</p>
		<h2>Accounts</h2>
		<p>
			An account is not required to use pixeldrain, but it enables some
			useful features. With a pixeldrain account you can access your files
			and albums on all your devices. You can also rename and delete files
			you have uploaded. And create and reorder albums you have created.
			Sign up for a pixeldrain account on <a href="/register">the
			registration page</a>. More about pixeldrain's features below.
		</p>
	</section>
</div>

<div class="page_content">
	<header>
		<h1 id="pro">Getting more out of pixeldrain</h1>
	</header>
	<section>
		<p>
			By purchasing a subscription you support pixeldrain on its mission
			to make content sharing easier, safer and faster for everyone. The
			standard subscription plans use Patreon for payment processing.
			Check out our <a href="#prepaid">prepaid plans</a> if you are
			interested in more professional services.
		</p>
		<br/>
		<FeatureTable></FeatureTable>
		<br/>
		<div style="text-align: center;">
			Do you need even more time and space? Check out our other plans
		</div>
		<br/>
		<OtherPlans></OtherPlans>
		<br/>
	</section>
</div>

<div class="page_content">
	<ForCreators/>
</div>

<Footer/>

<style>
.page_content {
	margin-top: 16px;
	margin-bottom: 16px;
}
@media (max-width: 1100px) {
	.page_content {
		margin-top: 0;
	}
}

.header_image_container {
	margin: auto;
	height: 200px;
	width: 750px;
	max-width: 100%;
	background-image: url("/res/img/header_orbitron_wide.webp");
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}
@media (max-width: 600px) {
	.header_image_container {
		background-image: url("/res/img/header_orbitron.webp");
	}
}
header>h1{
	color: #ffffff;
	margin: 40px 10px 40px 10px;
}
</style>
