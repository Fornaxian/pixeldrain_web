<script lang="ts">
import { fs_path_url } from "filesystem/FilesystemAPI";
import type { FSNavigator } from "filesystem/FSNavigator";

export let nav: FSNavigator
</script>

<iframe
	class="container"
	src={"/res/misc/pdf-viewer/web/viewer.html?file="+encodeURIComponent(fs_path_url($nav.base.path))}
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
