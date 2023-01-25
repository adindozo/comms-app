const input = document.getElementById('code');
AOS.init();
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}
input.addEventListener('input', function () {
    if (this.value.length > 8) {
        this.value = this.value.slice(0, 8);
    }
});


const button = document.getElementById('join');

const inputHeight = input.offsetHeight;
button.style.height = inputHeight + 'px';

setTimeout(() => {
    document.querySelector('.welcome-video-container-after').style.backgroundColor = 'rgba(0, 0, 0,0.7)';
    setTimeout(() => {
        document.querySelector('.join_meeting').style.opacity = 1;
        document.querySelector('header').style.opacity = 1;
        document.querySelector('.desc').style.opacity = 1;
    }, 1000);
}, 500); //tenor sans font for logo


