window.onload = function() {
    retriveData();
}

const labels = []
const Chartunderstanding = $('#chartUnderstanding');
const ChartAppreciation = $('#chartAppreciation');
const ctx1 = $('#chartReactions');
const ctx2 = $('#chartStudents');
var code2tiltle = {}
var code2reaction = {}
var code2slider = {}
var codeLogged = []
const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

function retriveData() {
    $.ajax({
        url: "./retriveAggStats",
        type: 'post',
        data: {
            codes: localStorage.getItem('codes')
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
                        // if (!labels.includes(code2tiltle[slider.video_code]))
                        //     labels.push(code2tiltle[slider.video_code])
                        code2slider[slider.video_code].understanding.push(slider.understanding);
                        code2slider[slider.video_code].appreciation.push(slider.appreciation);
                        if (slider.user_name.includes('@')) {
                            if (!codeLogged.includes(slider.video_code))
                                codeLogged.push(slider.video_code)
                            code2slider[slider.video_code].logged++;
                        } else
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
            var res1 = { 'l': [], 'd': [], 'c': [], total: 0, l1: 0, d1: 0, c1: 0 }
            var totStud1 = 0;
            var logged1 = 0;
            var res = { 'understanding': [], 'appreciation': [], 'anonim': [], 'logged': [] }
            Object.entries(code2tiltle).forEach(([key, value]) => {

                labels.push(code2tiltle[key])
                    //-----------------------------------------
                if (code2reaction[key]) {
                    res1.l.push(code2reaction[key].l)
                    res1.d.push(code2reaction[key].d)
                    res1.c.push(code2reaction[key].c);
                    res1.total += (code2reaction[key].l + code2reaction[key].d + code2reaction[key].c)
                    res1.l1 += code2reaction[key].l
                    res1.d1 += code2reaction[key].d
                    res1.c1 += code2reaction[key].c
                } else {
                    res1.l.push(0)
                    res1.d.push(0)
                    res1.c.push(0)
                }
                //-----------------------------------------
                res.understanding.push(average(code2slider[key].understanding).toFixed(2))
                res.appreciation.push(average(code2slider[key].appreciation).toFixed(2))
                res.logged.push(code2slider[key].logged);
                res.anonim.push(code2slider[key].anonim)
                totStud1 += code2slider[key].logged + code2slider[key].anonim;
                logged1 += code2slider[key].logged
            })


            $('#r1').append(' ' + (res1.total) + ' reactions ( <img src="../images/happy3.png" height="25px">: ' + res1.l1 + ', <img src="../images/sad3.png" height="25px">: ' + res1.d1 + ', <img src="../images/question.png" height="25px">: ' + res1.c1 + ' )')
            $('#u1').append(' ' + average(res.understanding.map(Number)).toFixed(2))
            $('#a1').append(' ' + average(res.appreciation.map(Number)).toFixed(2))
            if (codeLogged.length) {
                $('#s1').append(' ' + totStud1 + ' students ( <i onclick="goToStudStats()" class="fa fa-lg fa-user btn btn-user " data-toggle="tooltip"  title="See detail stats on logged students" ></i>: ' + logged1 + ', <i class="fa  fa-user-secret">: ' + (totStud1 - logged1) + ' )')
            } else {
                $('#s1').append(' ' + totStud1 + ' students ( <i class="fa fa-lg fa-user">: ' + logged1 + ', <i class="fa  fa-user-secret">: ' + (totStud1 - logged1) + ' )')
            }
            displayUnderstanding(res, Chartunderstanding, labels)
            displayAppreciation(res, ChartAppreciation, labels)
            displayStudents(res)
            displayReactions(res1)
            if (labels.length > 6) {
                $('.info').append('<div class="chartInfo cirigth row justify-content-center" ><div class="col-12 d-flex justify-content-center align-items-center"><h2>Click and drag to navigate the chart</h2></div><div class="col-12 d-flex justify-content-center"><span ><img src="../images/left-arrow.png" height="40px" width="40px"><img class="mouse" src="../images/mouse.png" height="80px" width="80px"><img src="../images/right-arrow.png" height="40px" width="40px"> </span></div></div>')
                $('.cirigth').css({ top: '0', rigth: '3.5vw', width: '85%', height: '85%' })
                setTimeout(function() {
                    $('.chartInfo').remove()
                }, 2000);
            }
            $('#nvid').text('These are the aggregated stats of the ' + labels.length + ' selected videos')
            $('#loading').hide()
        },
        error: function(data, status) {
            console.log(data);
        },
    });
}

function goToStudStats() {
    localStorage.setItem('codes', JSON.stringify(codeLogged))
    window.location.href = '../teacher/studentStats'
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

function displayStudents(data) {
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
    var chart = new Chart(ctx2, config);
}

function displayReactions(data) {
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: 'I get it',
                    data: data.l,
                    borderColor: '#253D70',
                    backgroundColor: pattern.draw('zigzag', 'rgba(37, 61, 112, 0.9)'),

                },
                {
                    label: 'I don\' t get it',
                    data: data.d,
                    borderColor: '#F1B467',
                    backgroundColor: pattern.draw('disc', 'rgba(241, 179, 103, 0.9)'),

                },
                {
                    label: 'Comments',
                    data: data.c,
                    borderColor: '#f01166',
                    backgroundColor: pattern.draw('diamond', 'rgba(240, 15, 101, 0.75)'),

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
                    suggestedMax: Math.max(...data.c, ...data.l, ...data.d) + 2,
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
    var chart = new Chart(ctx1, config);
}