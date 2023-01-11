console.log(code);
console.log(custom_cover_photo);
console.log(id);
function getAgeFromTimestamp(timestamp) {
    let obj = {
        style: 'long'
    }

    return luxon.DateTime.fromSeconds(timestamp).toRelative(obj)
}


function create_question_cards(question) {
    //     <div class="question_card">
    //     <p class="name-and-likes-container"> 
    //         <span class="username">Anonymous</span>
    //         <button data-liked="0" class="like">23</button>
    //     </p>
    //     <span class="age">13 years ago</span>
    //     <p class="question">Yo man sup wyd u up?</p>

    // </div>

    let question_card = document.createElement('div');
    question_card.id = question.questionid;
    question_card.classList.add('question_card');

    let name_and_likes_container = document.createElement('p');
    name_and_likes_container.className = 'name-and-likes-container';

    let name_span = document.createElement('span');
    name_span.className = 'username';
    name_span.innerText = question.username;
    if(!question.username) name_span.innerText='Anonymous';

    let like_button = document.createElement('button');
    like_button.className = 'like';
    like_button.dataset.liked = 0;
    like_button.innerText = question.likesnumber;

    like_button.addEventListener('click', (e) => {

        let n = parseInt(like_button.innerText);
        if (e.target.dataset.liked == 1) {
            e.target.dataset.liked = 0;
            e.target.style.backgroundImage = "url('thumbs-up-regular.svg')";
            like_button.innerText = n - 1;
            e.target.classList.remove("animate__animated", "animate__bounceIn");

        }
        else {
            like_button.innerText = n + 1;
            e.target.style.backgroundImage = "url('thumbs-up-solid.svg')";
            e.target.dataset.liked = 1;
            e.target.classList.add("animate__animated", "animate__bounceIn");
        }
        n = parseInt(like_button.innerText);
        let question_id=e.target.parentNode.parentNode.id;
        console.log('likeevent')
        socket.emit('update_like_count', question_id, n);

    })

    name_and_likes_container.appendChild(name_span);
    name_and_likes_container.appendChild(like_button);

    let age = document.createElement('span');
    age.className = 'age';
    age.innerHTML = getAgeFromTimestamp(parseInt(question.unixtime));

    let questionp = document.createElement('p');
    questionp.innerText = question.question;
    questionp.className = 'question';

    question_card.appendChild(name_and_likes_container);
    question_card.appendChild(age);
    question_card.appendChild(questionp);

    document.querySelector('main').appendChild(question_card);


}
let socket = io();
socket.on('connect', () => {
    //show questions on connect
    //each meeting will have its socket room. Room will be meeting id.
    //send req for questions from meeting with id
    let room = id;
    socket.emit('questions-req', id);
    socket.on('questions-res', (questions_array) => {
        for(let question of questions_array) create_question_cards(question);
    })
    document.getElementById('send').addEventListener('click', (e) => {
        e.preventDefault();
        let question_object = {};
        question_object.question = document.getElementById('question-input').value;
        question_object.username = document.getElementById('name').value;
        question_object.meetingid = id;
        document.getElementById('question-input').value = '';
        socket.emit('add_question_fromClient', question_object, room);//todo add question to databse and push to other connected clients.
    })
    socket.on('new_question', (new_question) => {
       
        let question_array = [new_question];
        create_question_cards(question_array);
    })
    socket.on('update_like_count_fromServer',(question_id,n)=>{
        let q = document.getElementById(question_id).firstChild.getElementsByTagName('button')[0].innerText=n;
    })
})

var input = document.getElementById("name");
var charCount = document.getElementById("name-chars-count");

input.addEventListener("input", updateCharCount);

function updateCharCount() {
    var charsLeft = input.maxLength - input.value.length;
    charCount.innerHTML = charsLeft;
    if (charsLeft == 0) {
        charCount.style.color = "red";
    } else {
        charCount.style.color = "white";
    }
}
let input2 = document.getElementById("question-input");
let charCount2 = document.getElementById("question-chars-count");

input2.addEventListener("input", updateCharCount2);

function updateCharCount2() {
    var charsLeft = input2.maxLength - input2.value.length;
    charCount2.innerHTML = charsLeft;
    if (charsLeft == 0) {
        charCount2.style.color = "red";
    } else {
        charCount2.style.color = "white";
    }
}

document.querySelector("textarea").addEventListener('keydown', (e) => {
    if (e.keyCode == 13) e.preventDefault();
});


document.querySelector("input").addEventListener('keydown', (e) => {
    if (e.keyCode == 13) e.preventDefault();
});

