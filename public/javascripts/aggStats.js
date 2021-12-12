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
                var res1 = { 'l': [], 'd': [], 'c': [] }
                Object.entries(code2reaction).forEach(([key, value]) => {
                    res1.l.push(value.l)
                    res1.d.push(value.d)
                    res1.c.push(value.c);

                })

            }
            if (sliders) {
                sliders.forEach(slider => {
                    try {
                        if (!labels.includes(code2tiltle[slider.video_code]))
                            labels.push(code2tiltle[slider.video_code])
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
                var res = { 'understanding': [], 'appreciation': [], 'anonim': [], 'logged': [] }
                Object.entries(code2slider).forEach(([key, value]) => {
                    res.understanding.push(average(value.understanding).toFixed(2))
                    res.appreciation.push(average(value.appreciation).toFixed(2))
                    res.logged.push(value.logged);
                    res.anonim.push(value.anonim)
                })

            }
            Object.entries(code2tiltle).forEach(([key, value]) => {
                if (!labels.includes(code2tiltle[key]))
                    labels.push(code2tiltle[key])
            })

            displayUnderstanding(res, Chartunderstanding, labels)
            displayAppreciation(res, ChartAppreciation, labels)
            displayStudents(res)
            displayReactions(res1)
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
                // title: {
                //     display: true,
                //     text: 'Avg Understanding'
                // },
            },
            responsive: true,
            scales: {
                y: {
                    max: 100
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
                // title: {
                //     display: true,
                //     text: 'Avg Appreciations'
                // },
            },
            responsive: true,
            scales: {
                y: {
                    max: 100
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
                title: {
                    display: true,
                    text: 'Students tha watched the videos'
                },
            },
            responsive: true,
            scales: {
                y: {
                    suggestedMax: Math.max(...data.anonim, ...data.logged) + 2,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    };
    var chart = new Chart(ctx1, config);
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
                title: {
                    display: true,
                    text: 'Student\'s reactions'
                },
            },
            responsive: true,
            scales: {

                y: {
                    suggestedMax: Math.max(...data.c, ...data.l, ...data.d) + 2,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    };
    var chart = new Chart(ctx2, config);
}