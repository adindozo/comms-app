FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImageTransform,
    FilePondPluginImageCrop
)


FilePond.setOptions({

    imageResizeTargetWidth: 300,
    imageResizeTargetHeight: 300, //ignored smaller value to maintain aspect ratio, not ignored with resize mode on
    imageTransformOutputMimeType: 'image/jpeg',
    imageCropAspectRatio: '16:10'	

})

FilePond.parse(document.body); //change input files to filepond inputs