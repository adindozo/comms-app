FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImageTransform
)


FilePond.setOptions({
    stylePanelAspectRatio: 100 / 300,
    imageResizeTargetWidth: 300,
    imageResizeTargetHeight: 300, //ignored to maintain aspect ratio, not ignored with resize mode on
    imageTransformOutputMimeType: 'image/jpeg',
    imageCropAspectRatio: '16:10'	

})

FilePond.parse(document.body); //change input files to filepond inputs