window.onload = function() {
    retriveData();
}

const labels = []
const labels2 = []
const labelCompar = ['Group 1', 'Group 2']
const compareUnderstanding = $('#compareUnderstanding');
const compareAppreciation = $('#compareAppreciation');
const compareReactions = $('#compareReactions');
const compareStudents = $('#compareStudents');
const Chartunderstanding = $('#chartUnderstanding');
const Chartunderstanding1 = $('#chartUnderstanding1');
const ChartAppreciation = $('#chartAppreciation');
const ChartAppreciation1 = $('#chartAppreciation1');
const ChartReaction = $('#chartReactions');
const ChartStudent = $('#chartStudents');
const ChartReaction1 = $('#chartReactions1');
const ChartStudent1 = $('#chartStudents1');
var code2tiltle = {}
var code2reaction = {}
var code2slider = {}
const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
var group1 = JSON.parse(localStorage.getItem('group1'))
var group2 = JSON.parse(localStorage.getItem('group2'))
var codes = group1.concat(group2)
$('#v1').append(' ' + group1.length + ' videos')
$('#v2').append(' ' + group2.length + ' videos')

function retriveData() {
    $.ajax({
        url: "./retriveAggStats",
        type: 'post',
        data: {
            codes: JSON.stringify(codes)
        },
        success: function(data) {
            var reactions = data.reactions;
            var videos = data.videos;
            var sliders = data.sliders;
            if (videos) {
                videos.forEach(video => {
                    code2tiltle[video.video_code] = video.title;
                })
            }
            if (reactions) {
                reactions.forEach(reaction => {
                    try {
                        if (reaction.type == 'like') {
                            code2reaction[reaction.video_code].l++
                        } else if (reaction.type == 'dislike') {
                            code2reaction[reaction.video_code].d++
                        } else {
                            code2reaction[reaction.video_code].c++;
                        }
                    } catch (error) {
                        code2reaction[reaction.video_code] = { 'l': 0, 'd': 0, 'c': 0 };
                        if (reaction.type == 'like') {
                            code2reaction[reaction.video_code].l++
                        } else if (reaction.type == 'dislike') {
                            code2reaction[reaction.video_code].d++
                        } else {
                            code2reaction[reaction.video_code].c++;
                        }

                    }
                })


            }
            if (sliders) {
                sliders.forEach(slider => {
                    try {


                        code2slider[slider.video_code].understanding.push(slider.understanding);
                        code2slider[slider.video_code].appreciation.push(slider.appreciation);
                        if (slider.user_name.includes('@'))
                            code2slider[slider.video_code].logged++;
                        else
                            code2slider[slider.video_code].anonim++;
                    } catch (error) {
                        code2slider[slider.video_code] = { 'understanding': [], 'appreciation': [], 'anonim': 0, 'logged': 0 }
                        code2slider[slider.video_code].understanding.push(slider.understanding);
                        code2slider[slider.video_code].appreciation.push(slider.appreciation);
                        if (slider.user_name.includes('@'))
                            code2slider[slider.video_code].logged++;
                        else
                            code2slider[slider.video_code].anonim++;
                    }
                })
            }
            var res1 = { 'l': [], 'd': [], 'c': [], 'total': 0, 'l1': 0, 'd1': 0, 'c1': 0 }
            var res2 = { 'l': [], 'd': [], 'c': [], 'total': 0, 'l1': 0, 'd1': 0, 'c1': 0 }



            var resCompReaction = { l: [], d: [], c: [] }

            var res = { 'understanding': [], 'appreciation': [], 'anonim': [], 'logged': [] }
            var res3 = { 'understanding': [], 'appreciation': [], 'anonim': [], 'logged': [] }
            var totStud1 = 0;
            var logged1 = 0;
            var logged2 = 0;
            var totStud2 = 0;

            var resCompStud = { anonim: [], logged: [] }


            var resCompSlide = { appreciation: [], understanding: [] }


            Object.entries(code2tiltle).forEach(([key, value]) => {
                if (group1.includes(key)) {
                    res1.l.push(code2reaction[key].l)
                    res1.d.push(code2reaction[key].d)
                    res1.c.push(code2reaction[key].c);
                    res1.total += (code2reaction[key].l + code2reaction[key].d + code2reaction[key].c)
                    res1.l1 += code2reaction[key].l
                    res1.d1 += code2reaction[key].d
                    res1.c1 += code2reaction[key].c
                    labels.push(code2tiltle[key])
                    res.understanding.push(average(code2slider[key].understanding).toFixed(2))
                    res.appreciation.push(average(code2slider[key].appreciation).toFixed(2))
                    res.logged.push(code2slider[key].logged);
                    res.anonim.push(code2slider[key].anonim)
                    totStud1 += code2slider[key].logged + code2slider[key].anonim;
                    logged1 += code2slider[key].logged
                } else {

                    labels2.push(code2tiltle[key])
                    res2.l.push(code2reaction[key].l)
                    res2.d.push(code2reaction[key].d)
                    res2.c.push(code2reaction[key].c);
                    res2.total += (code2reaction[key].l + code2reaction[key].d + code2reaction[key].c)
                    res2.l1 += code2reaction[key].l
                    res2.d1 += code2reaction[key].d
                    res2.c1 += code2reaction[key].c
                    res3.understanding.push(average(code2slider[key].understanding).toFixed(2))
                    res3.appreciation.push(average(code2slider[key].appreciation).toFixed(2))
                    res3.logged.push(code2slider[key].logged);
                    res3.anonim.push(code2slider[key].anonim)
                    totStud2 += code2slider[key].logged + code2slider[key].anonim;
                    logged2 += code2slider[key].logged
                }

            })
            resCompSlide.understanding.push(average(res.understanding.map(Number)).toFixed(2), average(res3.understanding.map(Number)).toFixed(2))
            resCompSlide.appreciation.push(average(res.appreciation.map(Number)).toFixed(2), average(res3.appreciation.map(Number)).toFixed(2))
            resCompReaction.l.push(res1.l1, res2.l1)
            resCompReaction.d.push(res1.d1, res2.d1)
            resCompReaction.c.push(res1.c1, res2.c1)
            resCompStud.logged.push(logged1, logged2)
            resCompStud.anonim.push((totStud1 - logged1), (totStud2 - logged2))
            displayReactions(resCompReaction, compareReactions, labelCompar)
            $('#r1').append(' ' + (res1.total) + ' reactions ( <img src="../images/happy3.png" height="25px">: ' + res1.l1 + ', <img src="../images/sad3.png" height="25px">: ' + res1.d1 + ', <img src="../images/question.png" height="25px">: ' + res1.c1 + ' )')
            $('#r2').append(' ' + (res2.total) + ' reactions ( <img src="../images/happy3.png" height="25px">: ' + res2.l1 + ', <img src="../images/sad3.png" height="25px">: ' + res2.d1 + ', <img src="../images/question.png" height="25px">: ' + res2.c1 + ' )')

            $('#u1').append(' ' + average(res.understanding.map(Number)).toFixed(2) + ' and an Avg. Appreciation of: ' + average(res.appreciation.map(Number)).toFixed(2))
            $('#u2').append(' ' + average(res3.understanding.map(Number)).toFixed(2) + ' and an Avg. Appreciation of: ' + average(res3.appreciation.map(Number)).toFixed(2))
            $('#s1').append(' ' + totStud1 + ' students ( <i class="fa fa-lg fa-user">: ' + logged1 + ', <i class="fa  fa-user-secret">: ' + (totStud1 - logged1) + ' )')
            $('#s2').append(' ' + totStud2 + ' students ( <i class="fa fa-lg fa-user">: ' + logged2 + ', <i class="fa  fa-user-secret">: ' + (totStud2 - logged2) + ' )')
            displayStudents(resCompStud, compareStudents, labelCompar)
            displayUnderstanding(resCompSlide, compareUnderstanding, labelCompar)
            displayAppreciation(resCompSlide, compareAppreciation, labelCompar)
            displayUnderstanding(res, Chartunderstanding, labels)
            displayUnderstanding(res3, Chartunderstanding1, labels2)
            displayAppreciation(res, ChartAppreciation, labels)
            displayAppreciation(res3, ChartAppreciation1, labels2)
            displayStudents(res, ChartStudent, labels)
            displayStudents(res3, ChartStudent1, labels2)
            displayReactions(res1, ChartReaction, labels)
            displayReactions(res2, ChartReaction1, labels2)
            $('#loading').hide()
        },
        error: function(data, status) {
            console.log(data);
        },
    });
}

function displayUnderstanding(data, ctx, labels) {
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Understanding',
                data: data.understanding,
                borderColor: '#0072B2',
                backgroundColor: pattern.draw('dash', 'rgba(0, 114, 178, 0.9)'),
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'top',
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        speed: 2,
                        threshold: 5,
                    },
                    zoom: {
                        wheel: {
                            enabled: false,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',

                    },

                }
            },
            responsive: true,
            scales: {
                y: {
                    max: 100
                },
                x: {
                    max: 5
                }
            }
        }
    };
    var chart = new Chart(ctx, config);
}

function displayAppreciation(data, ctx, labels) {
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Appreciation',
                data: data.appreciation,
                borderColor: '#D55E00',
                backgroundColor: pattern.draw('weave', 'rgba(213, 94, 0, 0.9)'),

            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'top',
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        speed: 2,
                        threshold: 5,
                    },
                    zoom: {
                        wheel: {
                            enabled: false,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',

                    },

                }
            },
            responsive: true,
            scales: {
                y: {
                    max: 100
                },

                x: {
                    max: 5
                }
            }
        }
    };
    var chart = new Chart(ctx, config);
}

function displayStudents(data, ctx, labels) {
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Logged',
                    data: data.logged,
                    borderColor: '#009E73',
                    backgroundColor: pattern.draw('square', 'rgba(0, 158, 115, 0.9)'),
                    stack: 'Stack 0',
                },
                {
                    label: 'Anonim',
                    data: data.anonim,
                    borderColor: '#F0E442',
                    backgroundColor: pattern.draw('triangle', 'rgba(240, 228, 66, 0.9)'),
                    stack: 'Stack 0',
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    position: 'top',
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        speed: 2,
                        threshold: 5,
                    },
                    zoom: {
                        wheel: {
                            enabled: false,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',

                    },

                }
            },
            responsive: true,
            scales: {
                y: {
                    suggestedMax: Math.max(...data.anonim, ...data.logged) + 2,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    max: 5
                }
            }
        }
    };
    var chart = new Chart(ctx, config);
}

function displayReactions(data, ctx, labels) {


    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: 'I get it',
                    data: data.l,
                    borderColor: '#253D70',
                    backgroundColor: pattern.draw('zigzag', 'rgba(37, 61, 112, 0.9)'),
                    stack: 'Stack 0',

                },
                {
                    label: 'I don\' t get it',
                    data: data.d,
                    borderColor: '#F1B467',
                    backgroundColor: pattern.draw('disc', 'rgba(241, 179, 103, 0.9)'),
                    stack: 'Stack 0',

                },
                {
                    label: 'Comments',
                    data: data.c,
                    borderColor: '#f01166',
                    backgroundColor: pattern.draw('diamond', 'rgba(240, 15, 101, 0.75)'),
                    stack: 'Stack 0',

                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    position: 'top',
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        speed: 2,
                        threshold: 5,
                    },
                    zoom: {
                        wheel: {
                            enabled: false,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',

                    },

                }
            },
            responsive: true,
            scales: {
                x: {

                    min: 0,
                    max: 5,
                },
                y: {
                    suggestedMax: Math.max(...data.c) + Math.max(...data.l) + Math.max(...data.d) + 2,
                    ticks: {
                        stepSize: 1
                    }
                },

            }
        }
    };
    var chart = new Chart(ctx, config);
}