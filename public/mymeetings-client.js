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
    
    new_meeting_window.style.display='block';
    
    setTimeout(() => {
        new_meeting_window.style.opacity=1;
    }, 0);
    
  });

x.addEventListener('click',() => {
    document.querySelector('form').reset();
    new_meeting_window.style.opacity=0;
    setTimeout(() => {
        new_meeting_window.style.display = "none";
    }, 250);
  
    
});

document.getElementById('new_meeting').addEventListener('click',(e) => {
    if(e.target == document.getElementById('new_meeting')) {
        document.querySelector('form').reset();
        new_meeting_window.style.opacity=0;
        setTimeout(() => {
            new_meeting_window.style.display = "none";
        }, 250);
      
    }
})