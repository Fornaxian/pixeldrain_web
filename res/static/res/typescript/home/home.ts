declare var apiEndpoint: string;
var uploader:        UploadManager|null = null;
var finishedUploads: Array<string>      = new Array()
var totalUploads:    number             = 0

class UploadProgressBar implements FileUpload {
	private uploadDiv:   HTMLAnchorElement
	private uploadDivJQ: JQuery<HTMLElement>
	private queueNum:    number

	constructor(file: File){
		this.file = file
		this.name = file.name
		this.queueNum = totalUploads
		totalUploads++

		this.uploadDiv = document.createElement("a")
		this.uploadDiv.setAttribute("class", "file_button")
		this.uploadDiv.innerText = "Queued\n" + this.file.name
		this.uploadDivJQ = $(this.uploadDiv)

		$("#uploads_queue").append(
			this.uploadDivJQ.hide().fadeIn('slow').css("display", "")
		)
	}

	// Interface stuff
	public file: File
	public name: string
	public onProgress(progress: number){
		this.uploadDiv.innerText = "Uploading... " + Math.round(progress*1000)/10 + "%\n" + this.file.name
		this.uploadDiv.setAttribute(
			'style',
			'background: linear-gradient('
				+'to right, '
				+'#111 0%, '
				+'var(--highlight_color) '+ ((progress*100)) +'%, '
				+'#111 '+ ((progress*100)+1) +'%)'
		)
	}
	public onFinished(id: string){
		finishedUploads[this.queueNum] = id

		this.uploadDiv.setAttribute('style', 'background: #111')
		this.uploadDiv.setAttribute('href', '/u/'+id)
		this.uploadDiv.setAttribute("target", "_blank");
		this.uploadDivJQ.html(
			'<img src="'+apiEndpoint+'/file/'+id+'/thumbnail" alt="'+this.file.name+'"/>'
			+ this.file.name+'<br/>'
			+ '<span style="color: var(--highlight_color);">'+window.location.hostname+'/u/'+id+'</span>'
		)
	}
	public onFailure(response: JQuery.Ajax.ErrorTextStatus, error: string) {
		this.uploadDiv.setAttribute('style', 'background: #821C40')
		this.uploadDivJQ.html(
			this.file.name+'<br/>'
			+ 'Upload failed after three tries!'
		)
	}
}

function handleUploads(files: FileList) {
	if (uploader === null){
		uploader = new UploadManager()

		$("#uploads_queue").animate(
			{"height": "340px"},
			{"duration": 2000, queue: false}
		);
	}

	for (var i = 0; i < files.length; i++) {
		uploader.uploadFile(new UploadProgressBar(files.item(i)))
	}
}

/*
 * Form upload handlers
 */

// Relay click event to hidden file field
$("#select_file_button").click(function(){$("#file_input_field").click()})

$("#file_input_field").change(function(evt){
	handleUploads((<HTMLInputElement>evt.target).files)

	// This resets the file input field
	// http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
	$('#file_name').html("")
	$("#file_upload_button").css("visibility", "hidden");
	(<HTMLFormElement>$("#file_input_field").wrap("<form>").closest("form").get(0)).reset()
	$("#file_input_field").unwrap()
})

/*
 * Drag 'n Drop upload handlers
 */
$(document).on('dragover', function (e) {
	e.preventDefault()
	e.stopPropagation()
})
$(document).on('dragenter', function (e) {
	e.preventDefault()
	e.stopPropagation()
})
document.addEventListener('drop', function(e: DragEvent){
	if (e.dataTransfer && e.dataTransfer.files.length > 0) {
		e.preventDefault()
		e.stopPropagation()

		handleUploads(e.dataTransfer.files)
	}
})
