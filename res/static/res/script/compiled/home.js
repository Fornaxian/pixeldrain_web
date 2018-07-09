var uploader = null;
var finishedUploads = new Array();
var totalUploads = 0;
var UploadProgressBar = /** @class */ (function () {
    function UploadProgressBar(file) {
        this.file = file;
        this.name = file.name;
        this.queueNum = totalUploads;
        totalUploads++;
        this.uploadDiv = document.createElement("a");
        this.uploadDiv.setAttribute("class", "file_button");
        this.uploadDiv.innerText = "Queued\n" + this.file.name;
        this.uploadDivJQ = $(this.uploadDiv);
        $("#uploads_queue").append(this.uploadDivJQ.hide().fadeIn('slow').css("display", ""));
    }
    UploadProgressBar.prototype.onProgress = function (progress) {
        this.uploadDiv.innerText = "Uploading... " + Math.round(progress * 1000) / 10 + "%\n" + this.file.name;
        this.uploadDiv.setAttribute('style', 'background: linear-gradient('
            + 'to right, '
            + '#111 0%, '
            + 'var(--highlight_color) ' + ((progress * 100)) + '%, '
            + '#111 ' + ((progress * 100) + 1) + '%)');
    };
    UploadProgressBar.prototype.onFinished = function (id) {
        finishedUploads[this.queueNum] = id;
        this.uploadDiv.setAttribute('style', 'background: #111');
        this.uploadDiv.setAttribute('href', '/u/' + id);
        this.uploadDiv.setAttribute("target", "_blank");
        this.uploadDivJQ.html('<img src="' + apiEndpoint + '/file/' + id + '/thumbnail" alt="' + this.file.name + '"/>'
            + this.file.name + '<br/>'
            + '<span style="color: var(--highlight_color);">' + window.location.hostname + '/u/' + id + '</span>');
    };
    UploadProgressBar.prototype.onFailure = function (response, error) {
        this.uploadDiv.setAttribute('style', 'background: #821C40');
        this.uploadDivJQ.html(this.file.name + '<br/>'
            + 'Upload failed after three tries!');
    };
    return UploadProgressBar;
}());
function handleUploads(files) {
    if (uploader === null) {
        uploader = new UploadManager();
        $("#uploads_queue").animate({ "height": "340px" }, { "duration": 2000, queue: false });
    }
    for (var i = 0; i < files.length; i++) {
        uploader.uploadFile(new UploadProgressBar(files.item(i)));
    }
}
/*
 * Form upload handlers
 */
// Relay click event to hidden file field
$("#select_file_button").click(function () { $("#file_input_field").click(); });
$("#file_input_field").change(function (evt) {
    handleUploads(evt.target.files);
    // This resets the file input field
    // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery
    $('#file_name').html("");
    $("#file_upload_button").css("visibility", "hidden");
    $("#file_input_field").wrap("<form>").closest("form").get(0).reset();
    $("#file_input_field").unwrap();
});
/*
 * Drag 'n Drop upload handlers
 */
$(document).on('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});
$(document).on('dragenter', function (e) {
    e.preventDefault();
    e.stopPropagation();
});
document.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleUploads(e.dataTransfer.files);
    }
});
var Cookie;
(function (Cookie) {
    function read(name) {
        var result = new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)').exec(document.cookie);
        return result ? result[1] : null;
    }
    Cookie.read = read;
    function write(name, value, days) {
        if (!days) {
            days = 365 * 20;
        }
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    Cookie.write = write;
    function remove(name) {
        write(name, "", -1);
    }
    Cookie.remove = remove;
})(Cookie || (Cookie = {}));
var UploadManager = /** @class */ (function () {
    function UploadManager() {
        this.uploadQueue = new Array();
        this.uploadThreads = new Array();
        this.maxThreads = 3;
    }
    UploadManager.prototype.uploadFile = function (file) {
        console.debug("Adding upload to queue");
        this.uploadQueue.push(file);
        if (this.uploadThreads.length < this.maxThreads) {
            console.debug("Starting upload thread");
            var thread_1 = new UploadWorker(this);
            this.uploadThreads.push(thread_1);
            setTimeout(function () { thread_1.start(); }, 0); // Start a new upload thread
        }
        else {
            for (var i = 0; i < this.uploadThreads.length; i++) {
                this.uploadThreads[i].start();
            }
        }
    };
    UploadManager.prototype.grabFile = function () {
        if (this.uploadQueue.length > 0) {
            return this.uploadQueue.shift();
        }
        else {
            return undefined;
        }
    };
    return UploadManager;
}());
var UploadWorker = /** @class */ (function () {
    function UploadWorker(manager) {
        this.tries = 0;
        this.uploading = false;
        this.manager = manager;
    }
    UploadWorker.prototype.start = function () {
        if (!this.uploading) {
            this.newFile();
        }
    };
    UploadWorker.prototype.newFile = function () {
        var file = this.manager.grabFile();
        if (file === undefined) {
            this.uploading = false;
            console.debug("No files left in queue");
            return; // Stop the thread
        }
        this.uploading = true;
        this.tries = 0;
        this.upload(file);
    };
    UploadWorker.prototype.upload = function (file) {
        console.debug("Starting upload of " + file.name);
        var formData = new FormData();
        formData.append('file', file.file);
        formData.append("name", file.name);
        var that = this; // jquery changes the definiton of "this"
        $.ajax({
            type: 'POST',
            url: apiEndpoint + "/file",
            data: formData,
            timeout: 7200000,
            cache: false,
            async: true,
            crossDomain: false,
            contentType: false,
            processData: false,
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        file.onProgress(evt.loaded / evt.total);
                    }
                }, false);
                return xhr;
            },
            success: function (data) {
                file.onFinished(data.id);
                that.setHistoryCookie(data.id);
                console.log("Done: " + data.id);
                that.newFile(); // Continue uploading on this thread
            },
            error: function (xhr, status, error) {
                console.log("status: " + status + " error: " + error);
                if (that.tries === 3) {
                    alert("Upload failed: " + status);
                    file.onFailure(status, error);
                    setTimeout(function () { that.newFile(); }, 2000); // Try to continue
                    return; // Upload failed
                }
                // Try again
                that.tries++;
                setTimeout(function () { that.upload(file); }, that.tries * 3000);
            }
        });
    };
    UploadWorker.prototype.setHistoryCookie = function (id) {
        var uc = Cookie.read("pduploads");
        // First upload in this browser
        if (uc === null) {
            Cookie.write("pduploads", id + ".", undefined);
            return;
        }
        if (uc.length > 2000) {
            // Cookie is becoming too long, drop the oldest two files
            uc = uc.substring(uc.indexOf(".") + 1).substring(uc.indexOf(".") + 1);
        }
        Cookie.write("pduploads", uc + id + ".", undefined);
    };
    return UploadWorker;
}());
