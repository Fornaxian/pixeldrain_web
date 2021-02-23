function EditWindow() {
	this.visible = false
	this.modal = new Modal(
		document.getElementById("file_viewer"),
		() => { this.toggle() },
		"Edit File", "1000px", "auto",
	)

	let clone = document.getElementById("tpl_edit_file").content.cloneNode(true)
	this.notification = clone.querySelector(".edit_file_notification")
	this.fileNameField = clone.querySelector(".edit_file_name_field")

	clone.querySelector(".btn_delete_file").addEventListener("click", () => { this.deleteFile() })
	clone.querySelector(".edit_file_name_form").addEventListener("submit", e => { this.renameFile(e) })

	this.modal.setBody(clone)

	this.btnEdit = document.getElementById("btn_edit")
	this.btnEdit.addEventListener("click", () => { this.toggle() })
}

EditWindow.prototype.toggle = function () {
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

EditWindow.prototype.setFile = function (file) {
	this.file = file
	this.modal.setTitle("Editing " + file.name)
	this.notification.style.display = "none"
	this.fileNameField.value = file.name

	if (this.file.can_edit) {
		this.btnEdit.style.display = ""
	} else {
		this.btnEdit.style.display = "none"
	}
}

EditWindow.prototype.notify = function (success, content) {
	this.notification.style.display = ""
	this.notification.classList = "edit_file_notification " + (success ? "highlight_green" : "highlight_red")
	this.notification.innerHTML = content
}

EditWindow.prototype.deleteFile = async function () {
	if (!confirm("Are you sure you want to delete '" + this.file.name + "'?")) {
		return
	}

	try {
		const resp = await fetch(this.file.get_href, { method: "DELETE" });
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}

		this.notify(true, "This file has been deleted, you can close the page")
	} catch (err) {
		this.notify(false, "Could not delete file: " + err)
	}
}

EditWindow.prototype.renameFile = async function (e) {
	e.preventDefault()

	const form = new FormData()
	form.append("action", "rename")
	form.append("name", this.fileNameField.value)

	try {
		const resp = await fetch(this.file.get_href, { method: "POST", body: form });
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}

		this.notify(true, "File name has been changed. Reload the page to see the changes")
	} catch (err) {
		this.notify(false, "Could not change file name: " + err)
	}
}
