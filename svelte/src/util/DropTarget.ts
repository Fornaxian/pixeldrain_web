export const drop_target = (
	node: HTMLElement,
	args: {
		upload: (files: File[]) => void,
		shadow: string | undefined,
	},
) => {
	const can_upload = (e: DragEvent) => {
		// Check for files
		if (
			e.dataTransfer &&
			e.dataTransfer.files &&
			e.dataTransfer.files.length > 0
		) {
			return true
		}

		if (e.dataTransfer && e.dataTransfer.items) {
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				if (e.dataTransfer.items[i].kind === "file") {
					return true
				}
			}
		}

		return false
	}
	const dragover = (e: DragEvent) => {
		if (can_upload(e)) {
			e.stopPropagation();
			e.preventDefault();
			if (args.shadow === undefined) {
				node.style.boxShadow = "var(--highlight_color) 0 0 2px 2px"
			} else {
				node.style.boxShadow = args.shadow
			}
		}
	}
	const dragleave = (e: DragEvent) => {
		node.style.boxShadow = ""
	}
	const drop = async (e: DragEvent) => {
		node.style.boxShadow = ""

		if (can_upload(e)) {
			e.stopPropagation();
			e.preventDefault();
		} else {
			return
		}

		// if directory support is available
		if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				const entry: FileSystemEntry | null = e.dataTransfer.items[i].webkitGetAsEntry();
				if (entry !== null) {
					read_dir_recursive(entry);
				}
			}
		} else if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const files: File[] = []
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				files.push(e.dataTransfer.files[i])
			}
			args.upload(files)
		}
	}
	const read_dir_recursive = (item: FileSystemEntry) => {
		if (item.isDirectory) {
			(item as FileSystemDirectoryEntry).createReader().readEntries(entries => {
				entries.forEach(entry => {
					read_dir_recursive(entry);
				});
			});
		} else {
			(item as FileSystemFileEntry).file(file => {
				args.upload([file])
			});
		}
	}

	node.addEventListener("dragover", dragover)
	node.addEventListener("dragenter", dragover)
	node.addEventListener("dragleave", dragleave)
	node.addEventListener("drop", drop)

	return {
		destroy() {
			node.removeEventListener("dragover", dragover)
			node.removeEventListener("dragenter", dragover)
			node.removeEventListener("dragleave", dragleave)
			node.removeEventListener("drop", drop)
		}
	}
}
