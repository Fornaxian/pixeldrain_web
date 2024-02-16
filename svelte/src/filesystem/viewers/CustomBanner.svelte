<script>
export let path = []

let image_uri
let image_link
$: update_links(path)
const update_links = (path) => {
	image_uri = null
	image_link = null
	for (let node of path) {
		if (node.properties && node.properties.branding_enabled === "true") {
			if (node.properties.brand_header_image) {
				image_uri = "/api/filesystem/"+node.properties.brand_header_image
			}
			if (node.properties.brand_header_link) {
				image_link = node.properties.brand_header_link
			}
		}
	}
}
</script>

{#if image_uri}
	<div class="container">
		{#if image_link}
			<a class="link" href={image_link} target="_blank" rel="noreferrer">
				<img class="image" src="{image_uri}" alt="User-provided banner"/>
			</a>
		{:else}
			<img class="image" src="{image_uri}" alt="User-provided banner"/>
		{/if}
	</div>
{/if}

<style>
.container {
	margin: 6px 0;
	text-align: center;
}
.link {
	display: inline-block;
}
.image {
	display: inline-block;
	margin: auto;
	max-height: 90px;
	max-width: 100%;
	border-radius: 6px;
}
</style>
