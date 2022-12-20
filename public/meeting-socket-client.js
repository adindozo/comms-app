console.log(code);
console.log(custom_cover_photo);
console.log(id);
function create_DOM_elements_from_questionArray(questions_array){
     // <div class="question" id="question-id-from-db">
        //      <span class="username">User name</span>
        //      <button class="like-button"></button>
        
        //      <p class='question-text'>Question</p>
        
        // </div>
    for(let question of questions_array){
        let question_div = document.createElement('div');
        question_div.id=question.questionid;
        question_div.classList.add('question');

        let name_span = document.createElement('span');
        name_span.className='username';
        name_span.innerText=question.username;

        let like_button = document.createElement('button');
        like_button.className='like-button';
        like_button.innerText=question.likesnumber;

        let question_paragraph = document.createElement('p');
        question_paragraph.innerText=question.question;
        question_paragraph.className='question-p';

        question_div.appendChild(name_span);
        question_div.appendChild(like_button);
        question_div.appendChild(question_paragraph);
        document.querySelector('main').appendChild(question_div);

    }
}
let socket = io();
socket.on('connect',()=>{
    //send req for questions from meeting with id
    socket.emit('questions-req',id);
    socket.on('questions-res',(questions_array)=>{
        create_DOM_elements_from_questionArray(questions_array);
    })
    document.getElementById('send').addEventListener('click',(e)=>{
        e.preventDefault();
        let question_object={};
        question_object.question=document.getElementById('question-input').value;
        question_object.username=document.getElementById('name').value;
        question_object.meetingid=id;
        document.getElementById('question-input').value='';
        socket.emit('add_question_fromClient',question_object);//todo add question to databse and push to other connected clients.
    })
    socket.on('new_question',(new_question)=>{
        console.log(new_question)
        let question_array = [new_question];
        create_DOM_elements_from_questionArray(question_array);
    })
})