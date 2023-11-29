<script>
import Footer from "../layout/Footer.svelte";
import AddressReputation from "./AddressReputation.svelte";
import FeatureTable from "./FeatureTable.svelte";
import ForCreators from "./ForCreators.svelte";
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
			you have uploaded. Sign up for a pixeldrain account on
			<a href="/register">the registration page</a>. More about
			pixeldrain's features below.
		</p>
		<h2>Privacy</h2>
		<p>
			Privacy is an important value for pixeldrain. There is too much
			tracking on the web nowadays. Pixeldrain goes in the other
			direction, this site does not contain any advertisements or third
			party tracking scripts. We don't even require you to enter an e-mail
			address to register an account.
		</p>
		<p>
			Not running ads does mean that we miss out on a lot of revenue of
			course. Running a site like this is a very expensive endeavour.
			Please consider supporting the project with one of the premium plans
			below.
		</p>
	</section>
</div>

<div class="page_content">
	<FeatureTable/>
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

header {
	background-image: url("/res/img/inflating_star.webp");
	background-repeat: no-repeat;
	background-attachment: fixed;
	background-position: center;
	background-size: cover;
	background-blend-mode: normal;
}
header > h1 {
	margin-top: 60px;
	margin-bottom: 60px;
	color: #ffffff;
	text-shadow: 0 0 3px #000000;
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
</style>
