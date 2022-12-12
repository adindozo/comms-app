module.exports = {
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
    }
    
    
}