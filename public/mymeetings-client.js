FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImageTransform,
    FilePondPluginImageCrop
)


FilePond.setOptions({

    imageResizeTargetWidth: 1280,
    imageResizeTargetHeight: 720, //ignored smaller value to maintain aspect ratio, not ignored with resize mode on
    imageTransformOutputMimeType: 'image/jpeg',
    imageCropAspectRatio: '16:9'

})

FilePond.parse(document.body); //change input files to filepond inputs
let new_meeting_window = document.getElementById('new_meeting');
let x = document.getElementById('x');
new_meeting_window.style.display = "none";
document.getElementById('new-meeting-button').addEventListener('click', (e) => {
    
    if (new_meeting_window.style.display === "none") {
        new_meeting_window.style.display = "block";
    } else {
        new_meeting_window.style.display = "none";
    }
});

x.addEventListener('click',() => {
    new_meeting_window.style.display = "none";
});