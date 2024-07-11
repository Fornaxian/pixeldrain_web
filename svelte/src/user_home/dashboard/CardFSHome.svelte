<script>
import { onMount } from "svelte";
import Navigator from "../../filesystem/Navigator.svelte";
import ListView from "../../filesystem/filemanager/ListView.svelte";
import { fs_encode_path } from "../../filesystem/FilesystemUtil";

let nav;
let state = {
	children: [],
};

const node_click = e => {
	window.location.href = "/d" + fs_encode_path(state.children[e.detail].path)
}
const node_share_click = e => {
	window.location.href = "/d/" + state.children[e.detail].id
}

onMount(() => {
	nav.navigate("/me", false)
})
</script>

<Navigator bind:this={nav} bind:state={state} history_enabled={false}/>

<ListView
	state={state}
	on:node_click={node_click}
	on:node_share_click={node_share_click}
	hide_edit
	hide_branding
/>
