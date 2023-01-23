let answered = questions.filter(question => question.answered === true).length;
let unanswered = questions.filter(question => question.answered === false).length;
let signed = questions.filter(question => Boolean(question.username) === true).length;
let unsigned = questions.filter(question => Boolean(question.username) === true).length;
var data1 = [{
    values: [answered, unanswered],
    labels: [`Answered questions(${answered})`, `Unanswered questions(${unanswered})`],
    type: `pie`,
    automargin: true
}];


var data2 = [{
    values: [unsigned, signed],
    labels: [`Anonymous questions(${unsigned})`, `Signed questions(${signed})`],
    type: `pie`
}];


var layout = {
    margin: {"t": 0, "b": 0, "l": 0, "r": 0},
    height: 400,
    width: 500,
    paper_bgcolor: `transparent`,
    font:{
        color:"white"
    }
};



Plotly.newPlot(`chartAnswered`, data1, layout);
Plotly.newPlot(`chartSigned`, data2, layout);

