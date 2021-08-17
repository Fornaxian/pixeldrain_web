function EmbedWindow(viewer) {
	this.viewer = viewer
	this.visible = false
	this.modal = new Modal(
		document.getElementById("file_viewer"),
		() => { this.toggle() },
		"Embed file", "850px", "auto",
	)

	let clone = document.getElementById("tpl_embed_popup").content.cloneNode(true)
	this.textarea = clone.querySelector(".embed_html_code")
	this.previewArea = clone.querySelector(".embed_preview_area")
	this.btnCopyHTML = clone.querySelector(".embed_copy_html")
	this.btnShowPreview = clone.querySelector(".embed_show_preview")
	this.modal.setBody(clone)

	this.btnCopyHTML.addEventListener("click", () => { this.copyHTML() })
	this.btnShowPreview.addEventListener("click", () => { this.showPreview() })

	this.btnEmbed = document.getElementById("btn_embed")
	this.btnEmbed.addEventListener("click", () => { this.toggle() })

	this.updateCode()
}

EmbedWindow.prototype.toggle = function () {
	if (this.visible) {
		this.modal.close()
		this.btnEmbed.classList.remove("button_highlight")
		this.visible = false
	} else {
		this.modal.open()
		this.btnEmbed.classList.add("button_highlight")
		this.visible = true
	}
}

EmbedWindow.prototype.updateCode = function () {
	let url
	if (this.viewer.isFile) {
		url = domainURL() + "/u/" + this.viewer.file.id + "?embed"
	} else {
		url = domainURL() + "/l/" + this.viewer.listId + "?embed"
	}

	this.textarea.value = `<iframe ` +
		`src="${url}" ` +
		`style="border: none; width: 800px; max-width: 100%; height: 500px; border-radius: 16px;"` +
		`></iframe>`
}

EmbedWindow.prototype.copyHTML = function () {
	if (copyText(this.textarea.value)) {
		console.log('Text copied')
		this.btnCopyHTML.innerHTML = `<i class="icon">content_copy</i> Copied!`
		this.btnCopyHTML.classList.add("button_highlight")
	} else {
		console.log('Copying not supported')
		this.btnCopyHTML.innerText = "Error!"
		alert("Your browser does not support copying text.")
	}
}

EmbedWindow.prototype.showPreview = function () {
	this.previewArea.innerHTML = this.textarea.value
}
