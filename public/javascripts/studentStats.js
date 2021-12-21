window.onload = function() {
    retriveData();
}

const labels = []
const ChartStudent = $('#chartStudent');
var code2tiltle = {}
var code2reaction = {}
var code2slider = {}
var studentDistribution = {}
var chartReaction;

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
                            code2reaction[reaction.user_name][reaction.video_code].l++
                        } else if (reaction.type == 'dislike') {
                            code2reaction[reaction.user_name][reaction.video_code].d++
                        } else {
                            code2reaction[reaction.user_name][reaction.video_code].c++;
                            code2reaction[reaction.user_name][reaction.video_code].comment.push(reaction.type);
                        }
                    } catch (error) {
                        if (reaction.user_name.includes('@')) {
                            if (!code2reaction[reaction.user_name])
                                code2reaction[reaction.user_name] = {};
                            code2reaction[reaction.user_name][reaction.video_code] = { 'l': 0, 'd': 0, 'c': 0, 'comment': [] };
                            if (reaction.type == 'like') {
                                code2reaction[reaction.user_name][reaction.video_code].l++
                            } else if (reaction.type == 'dislike') {
                                code2reaction[reaction.user_name][reaction.video_code].d++
                            } else {
                                code2reaction[reaction.user_name][reaction.video_code].c++;
                                code2reaction[reaction.user_name][reaction.video_code].comment.push(reaction.type);
                            }
                        }
                    }
                })
            }
            if (sliders) {

                sliders.forEach(slider => {

                    if (!labels.includes(code2tiltle[slider.video_code]))
                        labels.push(code2tiltle[slider.video_code])

                    try {
                        if (slider.user_name.includes('@')) {
                            code2slider[slider.user_name][slider.video_code].understanding += (slider.understanding);
                            code2slider[slider.user_name][slider.video_code].appreciation += (slider.appreciation);
                            studentDistribution[slider.video_code].logged++;
                        } else {

                            studentDistribution[slider.video_code].anonim++;
                        }


                    } catch (error) {
                        if (!studentDistribution[slider.video_code])
                            studentDistribution[slider.video_code] = { 'anonim': 0, 'logged': 0 }
                        if (slider.user_name.includes('@')) {
                            if (!code2slider[slider.user_name])
                                code2slider[slider.user_name] = {}
                            code2slider[slider.user_name][slider.video_code] = { 'understanding': 0, 'appreciation': 0 }
                            code2slider[slider.user_name][slider.video_code].understanding += (slider.understanding);
                            code2slider[slider.user_name][slider.video_code].appreciation += (slider.appreciation);
                            studentDistribution[slider.video_code].logged++;
                        } else {

                            studentDistribution[slider.video_code].anonim++;
                        }



                    }
                })
            }
            Object.entries(code2tiltle).forEach(([key, value]) => {
                if (!labels.includes(code2tiltle[key]))
                    labels.push(code2tiltle[key])
                $('#tableStats thead tr').append('<th colspan=2 scope="col" name="' + key + '">' + value + '</th>')
            })

            Object.entries(code2slider).forEach(([key, value]) => {
                first = 1
                $('#tableStats thead tr').children('th').each(function() {
                    if (first) {
                        first = 0
                        $('#tableStats tbody').append('<tr name=' + key + ' onclick="showDetail(this)"><td colspan=2 scope="col">' + key + ' </td></tr>')
                    } else {

                        if (value[$(this).attr('name')]) {
                            $('#tableStats tbody tr:last-child').append('<td colspan=2 scope="col"><i class="fa fa-check fa-lg" aria-hidden="true"></i> </td>')
                        } else {
                            $('#tableStats tbody tr:last-child').append('<td colspan=2 scope="col"> </td>')
                        }
                    }
                });
            })
            var totStud1 = 0;
            var logged1 = 0;
            var res = { 'anonim': [], 'logged': [] }
            Object.entries(studentDistribution).forEach(([key, value]) => {
                res.logged.push(value.logged);
                res.anonim.push(value.anonim);
                totStud1 += value.logged + value.anonim;
                logged1 += value.logged
            })
            displayStudents(res, ChartStudent, labels)
            $('#s1').append(' ' + totStud1 + ' students ( <i class="fa fa-lg fa-user">: ' + logged1 + ', <i class="fa  fa-user-secret">: ' + (totStud1 - logged1) + ' )')
            $('#loading').hide()
        },
        error: function(data, status) {
            console.log(data);
        },
    });
}

var actual;

function showDetail(e) {
    actual = e;
    $('#n').empty()
    $('#r1').empty()
    $('.modal-title').empty().append('Student ' + $(e).attr('name'))
    l = []
    res = { 'l': [], 'd': [], 'c': [], total: 0, l1: 0, d1: 0, c1: 0 }
    try {
        chartReaction.destroy()
    } catch (error) {

    }
    var chartReactions = $('#chartReactions')
    $('#tableComment tbody').empty()
    Object.entries(code2reaction[$(e).attr('name')]).forEach(([key, value]) => {
        l.push(code2tiltle[key])
        res.l.push(value.l)
        res.d.push(value.d)
        res.c.push(value.c);
        res.total += (value.l + value.d + value.c)
        res.l1 += value.l
        res.d1 += value.d
        res.c1 += value.c
        value.comment.forEach((c, i) => {
            $('#tableComment tbody').append('<tr><td colspan=1 scope="col">' + c + ' </td><td colspan=2 scope="col" style="vertical-align: middle;">' + code2tiltle[key] + ' </td></tr>')
        })
    })
    if ($('#tableComment tbody').children().length == 0) {
        $('#tableComment').hide()
    } else {
        $('#tableComment').show()
    }
    $('.modal-title').append(' watched ' + l.length + ' videos');
    $('#r1').append('The student gave a total of ' + (res.total) + ' reactions ( <img src="../images/happy3.png" height="25px">: ' + res.l1 + ', <img src="../images/sad3.png" height="25px">: ' + res.d1 + ', <img src="../images/question.png" height="25px">: ' + res.c1 + ' )')
    displayReactions(res, chartReactions, l)
    $('#aggStats').modal('show')
}

function nextStud() {
    if ($(actual).next().attr('name')) {
        showDetail($(actual).next())
    } else {
        $('#next').popover({
            placement: "auto",
            content: 'There are no next student'
        }).popover('show')
        setTimeout(function() {
            $('#next').popover('hide')
        }, 2000);
    }
}

function prevStud() {
    if ($(actual).prev().attr('name')) {
        showDetail($(actual).prev())
    } else {
        $('#prev').popover({
            placement: "auto",
            content: 'There are no previous student'
        }).popover('show')
        setTimeout(function() {
            $('#prev').popover('hide')
        }, 2000);
    }
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
                // title: {
                //     display: true,
                //     text: 'Student\'s reactions'
                // },
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
    chartReaction = new Chart(ctx, config);
}