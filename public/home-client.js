const input = document.getElementById('code');

input.addEventListener('input', function() {
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});


const button = document.getElementById('join');

const inputHeight = input.offsetHeight;
button.style.height = inputHeight + 'px';