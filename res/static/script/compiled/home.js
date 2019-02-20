var FinishedUpload = /** @class */ (function () {
    function FinishedUpload() {
    }
    return FinishedUpload;
}());
var uploader = null;
var finishedUploads = new Array();
var totalUploads = 0;
var queueDiv = document.getElementById("uploads_queue");
var UploadProgressBar = /** @class */ (function () {
    function UploadProgressBar(file) {
        this.file = file;
        this.name = file.name;
        this.queueNum = totalUploads;
        this.uploadDiv = document.createElement("a");
        totalUploads++;
        this.uploadDiv.classList.add("file_button");
        this.uploadDiv.style.opacity = "0";
        this.uploadDiv.innerText = "Queued\n" + this.file.name;
        queueDiv.appendChild(this.uploadDiv);
        // Browsers don't render the transition if the opacity is set and
        // updated in the same frame. So we have to wait a frame (or more)
        // before changing the opacity to make sure the transition triggers
        var d = this.uploadDiv; // `this` stops working after constructor ends
        window.setTimeout(function () { d.style.opacity = "1"; }, 100);
    }
    UploadProgressBar.prototype.onProgress = function (progress) {
        this.uploadDiv.innerText = "Uploading... " + Math.round(progress * 1000) / 10 + "%\n" + this.file.name;
        this.uploadDiv.style.background = 'linear-gradient('
            + 'to right, '
            + 'var(--file_background_color) 0%, '
            + 'var(--highlight_color) ' + ((progress * 100)) + '%, '
            + 'var(--file_background_color) ' + ((progress * 100) + 1) + '%)';
    };
    UploadProgressBar.prototype.onFinished = function (id) {
        finishedUploads[this.queueNum] = {
            id: id,
            name: this.file.name
        };
        this.uploadDiv.style.background = 'var(--file_background_color)';
        this.uploadDiv.href = '/u/' + id;
        this.uploadDiv.target = "_blank";
        var fileImg = document.createElement("img");
        fileImg.src = apiEndpoint + '/file/' + id + '/thumbnail';
        fileImg.alt = this.file.name;
        var linkSpan = document.createElement("span");
        linkSpan.style.color = "var(--highlight_color)";
        linkSpan.innerText = window.location.hostname + "/u/" + id;
        this.uploadDiv.innerHTML = ""; // Remove uploading progress
        this.uploadDiv.appendChild(fileImg);
        this.uploadDiv.appendChild(document.createTextNode(this.file.name));
        this.uploadDiv.appendChild(document.createElement("br"));
        this.uploadDiv.appendChild(linkSpan);
    };
    UploadProgressBar.prototype.onFailure = function (response, error) {
        this.uploadDiv.style.background = 'var(--danger_color)';
        this.uploadDiv.appendChild(document.createTextNode(this.file.name));
        this.uploadDiv.appendChild(document.createElement("br"));
        this.uploadDiv.appendChild(document.createTextNode("Upload failed after three tries:"));
        this.uploadDiv.appendChild(document.createElement("br"));
        this.uploadDiv.appendChild(document.createTextNode(error));
    };
    return UploadProgressBar;
}());
function handleUploads(files) {
    if (uploader === null) {
        uploader = new UploadManager();
        queueDiv.style.height = "340px";
    }
    for (var i = 0; i < files.length; i++) {
        uploader.uploadFile(new UploadProgressBar(files.item(i)));
    }
}
// List creation
function createList(title, anonymous) {
    if (uploader.uploading()) {
        var cont = confirm("Some files have not finished uploading yet. Creating a list now " +
            "will exclude those files.\n\nContinue?");
        if (!cont) {
            return;
        }
    }
    var postData = {
        "title": title,
        "anonymous": anonymous,
        "files": new Array()
    };
    for (var i = 0; i < finishedUploads.length; i++) {
        postData.files.push({
            "id": finishedUploads[i].id
        });
    }
    $.ajax({
        url: "/api/list",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify(postData),
        dataType: "json",
        success: function (response) {
            var resultString = "<div class=\"file_button\">"
                + '<img src="' + apiEndpoint + '/list/' + response.id + '/thumbnail"/>'
                + "List creation finished!<br/>"
                + title + "<br/>"
                + "<a href=\"/l/" + response.id + "\" target=\"_blank\">" + window.location.hostname + "/l/" + response.id + "</a>"
                + "</div>";
            $('#uploads_queue').append($(resultString).hide().fadeIn('slow').css("display", ""));
            $("#uploads_queue").animate({
                scrollTop: $("#uploads_queue").prop("scrollHeight")
            }, 1000);
            window.open('/l/' + response.id, '_blank');
        },
        error: function (xhr, status, error) {
            console.log("xhr:");
            console.log(xhr);
            console.log("status:");
            console.log(status);
            console.log("error:");
            console.log(error);
            var resultString = "<div class=\"file_button\">List creation failed<br/>"
                + "The server responded with this: <br/>"
                + xhr.responseJSON.message
                + "</div>";
            $('#uploads_queue').append($(resultString).hide().fadeIn('slow').css("display", ""));
        }
    });
}
// Form upload handlers
// Relay click event to hidden file field
document.getElementById("select_file_button").onclick = function () {
    document.getElementById("file_input_field").click();
};
document.getElementById("file_input_field").onchange = function (evt) {
    handleUploads(evt.target.files);
    // This resets the file input field
    document.getElementById("file_input_field").nodeValue = "";
};
/*
 * Drag 'n Drop upload handlers
 */
document.ondragover = function (e) {
    e.preventDefault();
    e.stopPropagation();
};
document.ondragenter = function (e) {
    e.preventDefault();
    e.stopPropagation();
};
document.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleUploads(e.dataTransfer.files);
    }
});
// Style selector
$("input[name=style]").change(function (evt) {
    Cookie.write("style", evt.target.id.substring(6));
    location.reload();
});
function copyText(text) {
    // Create a textarea to copy the text from
    var ta = document.createElement("textarea");
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    ta.value = text; // Put the text in the textarea
    // Add the textarea to the DOM so it can be seleted by the user
    document.body.appendChild(ta);
    ta.select(); // Select the contents of the textarea
    var success = document.execCommand("copy"); // Copy the selected text
    document.body.removeChild(ta); // Remove the textarea
    return success;
}
// Create list button
document.getElementById("btn_create_list").addEventListener("click", function (evt) {
    var title = prompt("You are creating a list containing " + finishedUploads.length + " files.\n"
        + "What do you want to call it?", "My New Album");
    if (title === null) {
        return;
    }
    createList(title, false);
});
var btnCopyLinks = document.getElementById("btn_copy_links");
btnCopyLinks.addEventListener("click", function () {
    var text = "";
    // Add the text to the textarea
    for (var i = 0; i < finishedUploads.length; i++) {
        // Example: https://pixeldrain.com/u/abcd1234: Some_file.png
        text += window.location.protocol + "//" + window.location.hostname + "/u/" + finishedUploads[i].id +
            ": " + finishedUploads[i].name + "\n";
    }
    var defaultButtonText = btnCopyLinks.innerHTML;
    // Copy the selected text
    if (copyText(text)) {
        btnCopyLinks.classList.add("button_highlight");
        btnCopyLinks.innerHTML = "Links copied to clipboard!";
        // Return to normal
        setTimeout(function () {
            btnCopyLinks.innerHTML = defaultButtonText;
            btnCopyLinks.classList.remove("button_highlight");
        }, 60000);
    }
    else {
        btnCopyLinks.classList.add("button_red");
        btnCopyLinks.innerHTML = "Copying links failed";
        setTimeout(function () {
            btnCopyLinks.innerHTML = defaultButtonText;
            btnCopyLinks.classList.remove("button_red");
        }, 60000);
    }
});
var btnCopyBBCode = document.getElementById("btn_copy_bbcode");
btnCopyBBCode.addEventListener("click", function () {
    var text = "";
    // Add the text to the textarea
    for (var i = 0; i < finishedUploads.length; i++) {
        // Example: [url=https://pixeldrain.com/u/abcd1234]Some_file.png[/url]
        text += "[url=" + window.location.protocol + "//" + window.location.hostname +
            "/u/" + finishedUploads[i].id + "]" +
            finishedUploads[i].name + "[/url]\n";
    }
    var defaultButtonText = btnCopyBBCode.innerHTML;
    // Copy the selected text
    if (copyText(text)) {
        btnCopyBBCode.classList.add("button_highlight");
        btnCopyBBCode.innerHTML = "BBCode copied to clipboard!";
        // Return to normal
        setTimeout(function () {
            btnCopyBBCode.innerHTML = defaultButtonText;
            btnCopyBBCode.classList.remove("button_highlight");
        }, 60000);
    }
    else {
        btnCopyBBCode.classList.add("button_red");
        btnCopyBBCode.innerHTML = "Copying links failed";
        setTimeout(function () {
            btnCopyBBCode.innerHTML = defaultButtonText;
            btnCopyBBCode.classList.remove("button_red");
        }, 60000);
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
    UploadManager.prototype.uploading = function () {
        for (var i = 0; i < this.uploadThreads.length; i++) {
            if (this.uploadThreads[i].isUploading()) {
                return true;
            }
        }
        return false;
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
    UploadWorker.prototype.isUploading = function () { return this.uploading; };
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
        formData.append("name", file.name);
        formData.append('file', file.file);
        var that = this; // jquery changes the definiton of "this"
        $.ajax({
            type: 'POST',
            url: apiEndpoint + "/file",
            data: formData,
            timeout: 21600000,
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
        // Make sure the user is not logged in, for privacy. This keeps the
        // files uploaded while logged in and anonymously uploaded files
        // separated
        if (Cookie.read("pd_auth_key") !== null) {
            return;
        }
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
