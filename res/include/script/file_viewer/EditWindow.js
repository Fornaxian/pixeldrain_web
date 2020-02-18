function EditWindow() {
	this.visible = false
	this.modal   = new Modal(
		document.getElementById("file_viewer"),
		() => { this.toggle() },
		"Edit File", "1000px", "auto",
	)

	let clone = document.getElementById("tpl_edit_file").content.cloneNode(true)
	clone.querySelector(".btn_delete_file").addEventListener("click", () => { this.deleteFile() })
	this.modal.setBody(clone)

	this.btnEdit = document.getElementById("btn_edit")
	this.btnEdit.addEventListener("click", () => { this.toggle() })
}

EditWindow.prototype.toggle = function() {
	if (this.visible) {
		this.modal.close()
		this.btnEdit.classList.remove("button_highlight")
		this.visible = false
	} else if (!this.visible && this.file.can_edit) {
		this.modal.open()
		this.btnEdit.classList.add("button_highlight")
		this.visible = true
	}
}

EditWindow.prototype.setFile = function(file) {
	this.file = file
	this.modal.setTitle("Editing "+file.name)

	if (this.file.can_edit) {
		this.btnEdit.style.display = ""
	} else {
		this.btnEdit.style.display = "none"
	}
}

EditWindow.prototype.deleteFile = function() {
	if (!confirm("Are you sure you want to delete '"+this.file.name+"'?")) {
		return
	}

	fetch(
		this.file.get_href, {method: "DELETE"}
	).then(resp => {
		this.modal.setBody(document.createTextNode("This file has been deleted"))
	}).catch(err => {
		alert("Error! Could not delete file")
	})
}
