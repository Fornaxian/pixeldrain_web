function VideoViewer(viewer, file, next) {
	this.viewer = viewer
	this.file = file
	this.next = next
}

VideoViewer.prototype.render = function (parent) {
	if (this.file.allow_video_player) {
		let vidContainer = document.createElement("div")
		vidContainer.classList = "image-container"

		let vidElement = document.createElement("video")
		vidElement.controls = "controls"
		vidElement.playsInline = "playsInline"
		vidElement.classList = "center drop_shadow"
		vidElement.addEventListener("ended", () => { this.next() }, false)
		if (!embeddedViewer) {
			vidElement.autoplay = "autoplay"
		}

		let videoSource = document.createElement("source")
		videoSource.src = this.file.get_href
		videoSource.type = this.file.mime_type

		vidElement.appendChild(videoSource)
		vidContainer.appendChild(vidElement)
		parent.appendChild(vidContainer)

		// Possible fix for ios 15 video bug?
		videoSource.src = this.file.get_href
		videoSource.type = this.file.mime_type
	} else {
		let container = document.createElement("div")
		container.classList = "image-container"
		container.appendChild(document.createElement("br"))

		let title = document.createElement("h1")
		title.innerText = "This is a video file on pixeldrain"
		container.appendChild(title)

		let icon = document.createElement("img")
		icon.style.display = "inline-block"
		icon.style.verticalAlign = "middle"
		icon.src = this.file.icon_href
		container.appendChild(icon)

		let fileDetails = document.createElement("div")
		fileDetails.style.display = "inline-block"
		fileDetails.style.textAlign = "left"
		fileDetails.style.paddingLeft = "8px"
		fileDetails.style.verticalAlign = "middle"
		fileDetails.style.maxWidth = "600px"

		fileDetails.appendChild(document.createTextNode(
			`The online video player on pixeldrain has been disabled due to
			repeated abuse. You can still watch videos online by upgrading to
			Pro. Or download the video and watch it locally on your computer.`,
		))
		fileDetails.appendChild(document.createElement("br"))

		let upgradeBtn = document.createElement("a")
		upgradeBtn.innerHTML = `<i class="icon">upgrade</i> Upgrade to Pro`
		upgradeBtn.classList = "button button_highlight"
		upgradeBtn.href = `{{noescape "https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12"}}`
		fileDetails.appendChild(upgradeBtn)

		let downloadBtn = document.createElement("button")
		downloadBtn.innerHTML = `<i class="icon">save</i> Download`
		downloadBtn.addEventListener("click", () => { this.viewer.toolbar.download() })
		fileDetails.appendChild(downloadBtn)

		container.appendChild(fileDetails)
		parent.appendChild(container)
	}
}
