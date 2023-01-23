console.log(code);
console.log(custom_cover_photo);
console.log(id);
let sortby = 'time';//2 values for sortby: time and likes. Default 'time'. If value is time new questions are added by LIFO stack, otherwise FIFO queue
document.getElementById('sort').addEventListener('change',(e)=>{
    sortby=e.target.value; //time/likes
})
function getAgeFromTimestamp(timestamp) {
    let obj = {
        style: 'long'
    }

    return luxon.DateTime.fromSeconds(timestamp).toRelative(obj)
}

function sort_question_cards(sorttype){
    if(sorttype=='likes'){
        var question_cards = document.getElementsByClassName("question_card");
        var question_card_arr = Array.from(question_cards);
        question_card_arr.sort(function(a, b) {
            var a_likes = parseInt(a.getAttribute("data-likes"));
            var b_likes = parseInt(b.getAttribute("data-likes"));
            return b_likes - a_likes;
        });
        var question_container = document.getElementById("question_container");
        question_container.innerHTML='';
        question_card_arr.forEach(function(question_card) {
            question_container.appendChild(question_card);
        });
    }
    if(sorttype=='time'){
        var question_cards = document.getElementsByClassName("question_card");
        var question_card_arr = Array.from(question_cards);
        question_card_arr.sort(function(a, b) {
            var a_id = parseInt(a.id);
            var b_id = parseInt(b.id);
            return b_id - a_id;
        });
        var question_container = document.getElementById("question_container");
        question_container.innerHTML='';
        question_card_arr.forEach(function(question_card) {
            question_container.appendChild(question_card);
        });
    }
}

function create_question_card(question) { // function dependent upon value sortby
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
    if(question.answered) {
        setTimeout(() => {
            question_card.classList.add('answered');
        }, 0);
      
    }
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

    like_button.style.cursor='not-allowed';

    let answer_question_button = document.createElement('button');

    answer_question_button.addEventListener('click', (e) => {
        e.target.style.visibility='hidden';
        let question_id=e.target.parentNode.parentNode.id;
        document.getElementById(question_id).classList.add('answered');
        socket.emit('answer_question', question_id);

    })
    
    answer_question_button.className = 'answer_button';

    answer_question_button.title='Click to indicate that the question has been answered';

    if(question.answered) answer_question_button.style.visibility='hidden';
    name_and_likes_container.appendChild(like_button);
    name_and_likes_container.appendChild(name_span);
    name_and_likes_container.appendChild(answer_question_button);

    let age = document.createElement('span');
    age.className = 'age';
    age.innerHTML = getAgeFromTimestamp(parseInt(question.unixtime));

    let questionp = document.createElement('p');
    questionp.innerText = question.question;
    questionp.className = 'question';

    question_card.appendChild(name_and_likes_container);
    question_card.appendChild(age);
    question_card.appendChild(questionp);
    question_card.dataset.likes=question.likesnumber;

    
    //animate__animated animate__flipInX animation on qcard
    question_card.classList.add('animate__animated');
    question_card.classList.add('animate__flipInX');
    
    // question_card.classList.remove('animate__animated');
    // question_card.classList.remove('animate__flipInX');
  
    

    let question_container = document.getElementById("question_container");
    if(sortby=='likes') question_container.appendChild(question_card);
    if(sortby=='time') question_container.insertBefore(question_card, question_container.firstChild);

}
let socket = io();
socket.on('connect', () => {
    // setInterval(() => {
    //     socket.emit('only-to-socket','private');
    //     io.emit('to-all-sockets','public');
    // }, 1000);
    // socket.on('only-to-socket',(m)=>{
    //     console.log(m)
    // })
    // socket.on('to-all-sockets',(m)=>{
    //     console.log(m)
    // })
    //show questions on connect
    //each meeting will have its socket room. Room will be meeting id.
    //send req for questions from meeting with id
    
    socket.emit('questions-req', id); //on connection, user sends request for questions from meeting with provided id. That same id will be room.
    socket.on('questions-res', (questions_array) => {
        for(let question of questions_array) create_question_card(question);
        sort_question_cards(document.getElementById('sort').value);
    })
    
    


    socket.on('new_question', (new_question) => {
        create_question_card(new_question);
    })
    socket.on('update_like_count_fromServer',(question_id,n)=>{
        document.getElementById(question_id).dataset.likes=n;
        document.getElementById(question_id).firstChild.getElementsByTagName('button')[0].innerText=n;
    })
})





document.querySelector('.refresh').addEventListener('click',(e)=>{
    sort_question_cards(document.getElementById('sort').value);
})