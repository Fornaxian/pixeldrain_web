<script lang="ts">
import ToggleButton from "layout/ToggleButton.svelte";
import type { FSPermissions } from "filesystem/FilesystemAPI";

let { permissions = $bindable(<FSPermissions>{}) }: { permissions?: FSPermissions } = $props();
</script>

<ToggleButton group_first bind:on={permissions.read}>Read</ToggleButton>
<ToggleButton group_middle bind:on={permissions.write}>Write</ToggleButton>
<ToggleButton group_last bind:on={permissions.delete}>Delete</ToggleButton>
