let answered = questions.filter(question => question.answered === true).length;
let unanswered = questions.filter(question => question.answered === false).length;
let signed = questions.filter(question => Boolean(question.username) === true).length;
let unsigned = questions.filter(question => Boolean(question.username) === true).length;
var layout = {
    margin: { "t": 0, "b": 0, "l": 0, "r": 0 },
    height: 400,
    width: 500,
    paper_bgcolor: `transparent`,
    font: {
        color: "white"
    }
};

if (answered === 0 && unanswered === 0) {
    let span1 = document.createElement('span');
    span1.innerText="No answered or unanswered questions to display in the pie chart."
    document.getElementById('chartAnswered').appendChild(span1);
} else {
    var data1 = [{
        values: [answered, unanswered],
        labels: [`Answered questions(${answered})`, `Unanswered questions(${unanswered})`],
        type: `pie`,
        automargin: true
    }];
    Plotly.newPlot(`chartAnswered`, data1, layout);
}

if (signed === 0 && unsigned === 0) {
    let span2 = document.createElement('span')

    span2.innerText="No signed or unsigned questions to display in the pie chart."
    document.getElementById('chartSigned').appendChild(span2)

} else {
    var data2 = [{
        values: [unsigned, signed],
        labels: [`Anonymous questions(${unsigned})`, `Signed questions(${signed})`],
        type: `pie`
    }];
    Plotly.newPlot(`chartSigned`, data2, layout);
}