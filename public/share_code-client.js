function convertToGetRequest(route, params) {
    // Start the GET request string with the route
    let getRequest = route;

    // Add the parameters to the GET request string
    getRequest += '?';
    for (const param in params) {
        if (params.hasOwnProperty(param)) {
            getRequest += `${param}=${encodeURIComponent(params[param])}&`;
        }
    }

    // Remove the trailing '&' character
    getRequest = getRequest.slice(0, -1);

    return getRequest;
}

function show_snackbar(msg) {
    var x = document.getElementById("snackbar");
    x.innerText=msg;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

window.onload = function () {
   
    document.querySelector('.mail_share').addEventListener('submit', async (e) => {
        document.getElementById('send').style.display = 'none';
        document.querySelector('.loader').style.display = 'block';
        e.preventDefault();
        let mail = document.querySelector('input').value;
        let host = location.origin + '/send_mail/' + code;
        let params = {
            email: mail
        }
        let get_request = convertToGetRequest(host, params);
        let res = await fetch(get_request);
        document.getElementById('send').style.display = 'block';
        document.querySelector('.loader').style.display = 'none';
        if(res.ok) show_snackbar('Email successfully sent!');
        if(!res.ok) show_snackbar('Unfortunately, an unknown error occurred.');
    })
}