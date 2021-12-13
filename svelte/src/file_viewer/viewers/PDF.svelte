<script>
export const set_file = f => file = f
let file = {
	get_href: "",
}
</script>

<iframe
	class="container"
	src={"/res/misc/pdf-viewer/web/viewer.html?file="+encodeURIComponent(file.get_href)}
	title="PDF viewer">
</iframe>

<style>
.container {
	position: relative;
	display: block;
	height: 100%;
	width: 100%;
	text-align: center;
	overflow: hidden;
	border: none;
}
</style>
