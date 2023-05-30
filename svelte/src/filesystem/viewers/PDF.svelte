<script>
import { fs_path_url } from "../FilesystemUtil";

export let state
</script>

<iframe
	class="container"
	src={"/res/misc/pdf-viewer/web/viewer.html?file="+encodeURIComponent(fs_path_url(state.base.path))}
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
