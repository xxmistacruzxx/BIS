let itemPicturesInput;
let images;
let alerts;

function getExtension(filename) {
    var parts = filename.split(".");
    return parts[parts.length - 1];
}
  
function isImage(filename) {
    let ext = getExtension(filename);
    switch (ext.toLowerCase()) {
        case "jpg":
        case "png":
        case "tiff":
        case "jpeg":
        return true;
    }
    return false;
}

function onSubmitPictures(event) {
    let errors = [];
    if (itemPicturesInput.files.length == 0) {
        errors.push("Please select files to upload");
    }
    if (itemPicturesInput.files.length >= 7) {
        errors.push("You may select up to a max of 6 pictures");
    }
    if (errors.length > 0) {
        event.preventDefault();
        alerts.innerHTML = errors.toString();
        return;
    }
    for (const file of itemPicturesInput.files) {
        let fileName = file.name;
        if (!isImage(fileName)) errors.push("File types must be: jpg, jpeg, png, or tiff");
        if (file.size > 1 * 1024 * 1024) errors.push("File size limit exceeded.");
    }
    if (errors.length > 0) {
        event.preventDefault();
        alerts.innerHTML = errors.toString();
        return;
    }
}

function onRemoveAll(event) {
    let errors = [];
    if (images.length === 0) {
        errors.push("There are no images to remove");
    }
    if (errors.length > 0) {
        event.preventDefault();
        alerts.innerHTML = errors.toString();
        return;
    }
}

function setup() {
    itemPicturesInput = document.getElementById("image");
    images = document.querySelectorAll("img.move-right");
    alerts = document.getElementById("alerts");

    document.getElementById("addPicture").addEventListener("click", onSubmitPictures);
    document.getElementById("removeAll").addEventListener("click", onRemoveAll);
}

document.addEventListener("DOMContentLoaded", setup);