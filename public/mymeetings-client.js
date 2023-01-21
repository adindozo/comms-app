

let fetch_meetings = async function () {
    document.querySelector('#ul_loader').style.display = 'block';
    let res = await fetch('http://localhost:8080/mymeetings/meeting_list_json');
    let json_data = await res.json();
    document.querySelector('#ul_loader').style.display = 'none';
    for (let meeting of json_data) {
        create_meeting_card(meeting);
    }
}

function show_snackbar(msg) {
    var x = document.getElementById("snackbar");
    x.innerText = msg;
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}


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
    unixTimestampToDateString: (timestamp) => { //"DD.MM.YYYY"
        var date = new Date(timestamp * 1000);

        var day = date.getDate();
        var month = date.getMonth() + 1; // January is 0!
        var year = date.getFullYear();

        return day + '.' + month + '.' + year;
    },
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
const form = document.getElementById('form');
form.addEventListener('submit', async (e) => {

    e.preventDefault();

    let unixstart = functions.datetimeLocalToTimestamp(document.getElementById('unixstart').value);//change to unix timestamp in secs
    let unixend = functions.datetimeLocalToTimestamp(document.getElementById('unixend').value)//change to unix timestamp in secs

    if (!(unixstart || unixend || document.getElementById('name').value)) {
        return document.getElementById('error').innerHTML = 'Please ensure that all input fields, except cover photo, are properly filled out.';
    }
    if (unixstart > unixend) {
        return document.getElementById('error').innerHTML = 'Start time for all business activities must be scheduled to take place before the end time.';


    }

    if (functions.isDateInPast(unixend)) {

        return document.getElementById('error').innerHTML = 'End times for business activities must be scheduled to take place in the future.';


    }
    document.querySelector('#submit').style.display = 'none';
    document.querySelector('.loader').style.display = 'block';


    try {
        const formData = new FormData(form);
        let JSONdata = {};
        for (const [key, value] of formData) {
            if (key == 'cover') {
                if (typeof value == 'object') {//if value is object then user did not upload photo
                    JSONdata[key] = null;
                }

                if (typeof value == 'string') { //if value is object then user has uploaded photo
                    let coverJSON = JSON.parse(value);
                    JSONdata[key] = coverJSON.data;
                }

            } else JSONdata[key] = value;

        }

        const response = await fetch('/mymeetings/add_meeting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSONdata),
            credentials: 'include' // this will include cookies in the request
        });
        //code after this line is being executed after fetch create request
        document.querySelector('.loader').style.display = 'none';
        document.querySelector('#submit').style.display = 'block';

        if (!response.ok) return document.getElementById('error').innerHTML = 'Unfortunately, an unknown error occurred while processing your request.';
        //code after this line is being executed after successful fetch create request
        fetch_meetings();
        document.querySelector('.meeting_list').innerHTML = '';

        if (response.ok) {
            document.querySelector('form').reset();
            new_meeting_window.style.opacity = 0;
            setTimeout(() => {
                new_meeting_window.style.display = "none";
            }, 250);
            document.getElementById('error').innerHTML = '';
        }



    } catch (error) {
        document.getElementById('error').innerHTML = 'Unfortunately, an unknown error occurred while processing your request.';
    }


})

function create_meeting_card(json_meeting) {
    let meeting_name = document.createElement('span');
    let meeting_date = document.createElement('span');
    let indicator_container = document.createElement('div');
    let indicator = document.createElement('div');
    let three_dots_container = document.createElement('div');
    let three_dots = document.createElement('div');
    //todo .ellipsis_menu div
    let menu = document.createElement('div');

    let share_code_link = document.createElement('a');
    share_code_link.href = '/' + 'share_code/' + json_meeting.code + '/' + json_meeting.name;
    share_code_link.target = 'blank';
    share_code_link.innerText = 'Share invitation code';

    let admin_panel_link = document.createElement('a');
    admin_panel_link.innerText = 'Administration panel';
    admin_panel_link.href='/mymeetings/meeting_admin_panel/'+json_meeting.code;


    let delete_meeting_link = document.createElement('a');
    delete_meeting_link.innerText = 'Delete';
    delete_meeting_link.addEventListener('click', async (e) => {
        try {
            let id = e.target.parentNode.parentNode.dataset.meetingid;
            let route = location.origin + '/mymeetings/delete_meeting/' + id;
            let res = await fetch(route, {
                method: "delete"
            });
            if (res.ok) {
                document.getElementById(id + 'li').remove();
            } else {
                console.log(res)
                show_snackbar('Unfortunately, an unknown error occurred.');
            }
        } catch (error) {
            show_snackbar('Unfortunately, an unknown error occurred.');
        }

    })

    menu.appendChild(share_code_link);
    menu.appendChild(admin_panel_link);
    menu.appendChild(delete_meeting_link);
    menu.className = 'ellipsis_menu';
    // three_dots.dataset.meetingid=json_meeting.meetingid;
    three_dots.id = json_meeting.meetingid;
    if (functions.isDateInPast(json_meeting.unixend) || !functions.isDateInPast(json_meeting.unixstart)) {
        indicator.className = 'indicator-offline';
    } else indicator.className = 'indicator-online';
    indicator_container.className = 'indicator_container';
    indicator_container.appendChild(indicator);
    meeting_name.className = 'meeting_name';
    meeting_name.innerText = json_meeting.name;
    meeting_date.innerText = functions.unixTimestampToDateString(json_meeting.unixstart) + '. - ' + functions.unixTimestampToDateString(json_meeting.unixend) + '.';
    meeting_date.className = 'meeting_date';
    three_dots_container.className = 'three_dots_container';
    three_dots.className = 'three_dots';
    three_dots_container.appendChild(three_dots);
    let li = document.createElement('li');
    li.dataset.meetingid = json_meeting.meetingid;
    li.id = json_meeting.meetingid + 'li';
    if (json_meeting.coverphoto) {
        li.style.background = "linear-gradient(to right, var(--color-300),rgba(4, 41, 58,0.5)), url('meeting_pictures/" + json_meeting.meetingid + ".jpeg')";
        li.style.backgroundSize = "cover";
        li.style.backgroundPosition = "center";
        li.style.backgroundRepeat = "no-repeat";
    }

    li.appendChild(indicator_container);
    li.appendChild(meeting_name);
    li.appendChild(meeting_date);
    li.appendChild(three_dots_container);
    li.appendChild(menu);
    document.querySelector('.meeting_list').appendChild(li);
}

//  <!-- <li>
//  <div class="indicator_container">
//  <div class="indicator-offline"></div>
// </div>
// <span class="meeting_name">Dgesdge dsfg</span>
// <span class="meeting_date">21.9.2023 - 29.12.2024</span>
// <div class="three_dots_container">
//  <div class="three_dots"></div>
// </div>
// </li> -->
let meeting_list_dom_object = document.querySelector('.meeting_list');

window.onload = fetch_meetings;

document.querySelector('body').addEventListener('click', (e) => {
    const ellipsisMenus = document.querySelectorAll('.ellipsis_menu');
    ellipsisMenus.forEach((menu) => { //hide all currently shown menus
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
        }
    });
    if (e.target.className == 'three_dots') { //show clicked one
        let menu = e.target.parentNode.nextElementSibling;
        menu.style.display = menu.style.display == 'flex' ? 'none' : 'flex';
    }


})