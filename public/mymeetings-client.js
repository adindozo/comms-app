



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

    new_meeting_window.style.display = 'block';

    setTimeout(() => {
        new_meeting_window.style.opacity = 1;
    }, 0);

});

x.addEventListener('click', () => {
    document.querySelector('form').reset();
    new_meeting_window.style.opacity = 0;
    setTimeout(() => {
        new_meeting_window.style.display = "none";
    }, 250);
    document.getElementById('error').innerHTML = '';

});

document.getElementById('new_meeting').addEventListener('click', (e) => {
    if (e.target == document.getElementById('new_meeting')) {
        document.querySelector('form').reset();
        new_meeting_window.style.opacity = 0;
        setTimeout(() => {
            new_meeting_window.style.display = "none";
        }, 250);
        document.getElementById('error').innerHTML = '';

    }
})

let functions = {
    formatDate: function (timestamp) { //"DD.MM.YYYY HH:MM"

        const date = new Date(timestamp * 1000);
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString();

        return `${dateString} ${timeString}`;
    },
    isDateInPast: function (seconds) {

        var currentTime = new Date().getTime() / 1000;
        var givenTime = seconds;
        return givenTime < currentTime;
    },
    checkPassword: function (txt) {
        // check a password between {7,19} = 8 - 20 characters which contain at least one 
        // numeric digit, one uppercase and one lowercase letter
        let exp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,31}$/;
        return (exp.test(txt));
    },

    checkUsername: function (txt) {
        //  A valid username should start with an alphabet so, 
        //[A-Za-z]. All other characters can be alphabets, numbers or an underscore so,
        //[A-Za-z0-9_] 

        let exp = /^[A-Za-z][A-Za-z0-9_]{3,19}$/;
        return (exp.test(txt));
    },

    checkEmail: function (txt) {
        let exp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (exp.test(txt));
    },
    datetimeLocalToTimestamp: function (datetime) {
        // Create a new Date object from the datetime string
        const date = new Date(datetime);
        // Return the Unix timestamp in seconds
        return parseInt(date.getTime() / 1000);
    },
    currentTimeInUnixTimestamp: function () {
        // Get the current time in milliseconds
        var currentTime = Date.now();

        // Convert the current time to seconds
        var currentTimeInSeconds = Math.floor(currentTime / 1000);

        // Display the current time in Unix timestamp (in seconds)
        return currentTimeInSeconds;
    }

}

document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault();
  
    let unixstart = functions.datetimeLocalToTimestamp(document.getElementById('unixstart').value);//change to unix timestamp in secs
    let unixend = functions.datetimeLocalToTimestamp(document.getElementById('unixend').value)//change to unix timestamp in secs
    
    if(!(unixstart || unixend || document.getElementById('name').value)){
        document.getElementById('error').innerHTML = 'Please ensure that all input fields, except cover photo, are properly filled out.';
    }
    if (unixstart > unixend) {
        return document.getElementById('error').innerHTML = 'Start time for all business activities must be scheduled to take place before the end time.';
        
        
    }

    if(functions.isDateInPast(unixstart) || functions.isDateInPast(unixend)){
    
        return document.getElementById('error').innerHTML = 'Pursuant to company policy, all start and end times for business activities must be scheduled to take place in the future.';
        
        
    }
   
    e.preventDefault();
    const formData = new FormData(document.getElementById('form'));
    try {
        const response = await fetch('/mymeetings/add_meeting', {
          method: 'POST',
          body: formData,
          credentials: 'include' // this will include cookies in the request
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }


})