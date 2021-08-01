function QRCodeWindow(viewer) {
	this.viewer = viewer
	this.visible = false
	this.src = ""
	this.modal = new Modal(
		document.getElementById("file_viewer"),
		() => { this.toggle() },
		"QR code", "500px", "auto",
	)

	this.img = document.createElement("img")
	this.img.style.display = "block"
	this.img.style.width = "100%"
	this.modal.setBody(this.img)

	this.btnQRCode = document.getElementById("btn_qr_code")
	this.btnQRCode.addEventListener("click", () => { this.toggle() })

	this.setFile()
}

QRCodeWindow.prototype.toggle = function () {
	if (this.visible) {
		this.modal.close()
		this.btnQRCode.classList.remove("button_highlight")
		this.visible = false
	} else {
		this.modal.open()
		this.btnQRCode.classList.add("button_highlight")
		this.visible = true
		this.setFile()
	}
}

QRCodeWindow.prototype.setFile = function () {
	this.src = "/api/misc/qr?text=" + encodeURIComponent(window.location.href)

	if (this.visible) {
		this.img.src = this.src
	}
}
