<script>
import { tick } from "svelte";

import FileManager from "../filesystem/filemanager/FileManager.svelte";
import { fs_create_bucket, fs_get_node } from "../filesystem/FilesystemAPI.svelte";

let fm

let bucket_id = ""
let bucket_state = null
let write_password = ""

export const add_files = async files => {
	if (bucket_id === "") {
		write_password = gen_password(10)

		try {
			let bucket = await fs_create_bucket("", "", write_password)
			bucket_id = bucket.id
			bucket_state = await fs_get_node(bucket_id, "")
		} catch (err) {
			alert("Failed to create bucket! "+err)
		}
	}

	await tick()
	fm.upload(files)
}

const gen_password = len => {
	var pw = "";
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for ( var i = 0; i < len; i++ ) {
		pw += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return pw;
}

const navigate = async e => {
	try {
		let new_state = await fs_get_node(bucket_id, e.detail)
		bucket_state = new_state
	} catch (err) {
		alert("Failed to create bucket! "+err)
	}
}

</script>

{#if bucket_state !== null }
	<FileManager bind:this={fm} state={bucket_state} on:navigate={navigate}></FileManager>
{/if}
