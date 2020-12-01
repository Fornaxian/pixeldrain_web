<script>
import { fs_get_file_url } from "../FilesystemAPI.svelte";
export let state
</script>

<iframe
	class="container"
	src={"/res/misc/pdf-viewer/web/viewer.html?file="+encodeURIComponent(fs_get_file_url(state.bucket.id, state.base.path))}
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
