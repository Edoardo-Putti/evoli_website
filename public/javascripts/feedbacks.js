window.onload = function() {
    retriveData();
    $('#loading').css({
        top: $('#navbarCont').outerHeight()
    })
    $('[data-toggle="tooltip"]').tooltip()
}


var chapters
var url;
var player;
var video;
var end;
var focus = false;
var start;
var zoomAtTheMoment = 1;
var numSegments = 24;
var feedBackInThatSegment = [];
var Xlabels = [];
var chart;
var [l, d, c] = [
    [],
    [],
    []
]
var co = [];
var duration
var stat = [];
var chlabels = [];
var res = { 'l': [], 'd': [], 'c': [] }

function YTplayerMaker() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: 'auto',
        width: '90%',
        videoId: url,
        playerVars: { 'autoplay': false, fs: 0 },

    });
}



function retriveData() {
    $.ajax({
        url: "./retriveFeedbacks",
        type: 'post',
        success: function(data) {
            var sliders = data.sliders;
            var reactions = data.reactions;
            video = data.video;
            $("#classTitle").append(video.title)
            url = video.url
            duration = video.duration
            if (video.chapters) {
                chapters = JSON.parse(video.chapters)
                var n = 1
                if (Object.keys(chapters).length > 10) {
                    n = 2
                }
                if (Object.keys(chapters).length > 15) {
                    n = 2.5
                }
                if (Object.keys(chapters).length > 20) {
                    n = 3.5
                }
                if (Object.keys(chapters).length > 25) {
                    n = 4
                }

                $('#chapters').css({ width: window.screen.width * n })
                $('#chRow').css({ width: window.screen.width })

            }

            YTplayerMaker()
            var avgApp = 0;
            var avgUnd = 0;
            var logged = 0;

            if (chapters) {
                //$('#chartRow').attr('class', 'col-12 col-lg-6')
                $('#chapterRow').show()
                var keys = Object.keys(chapters);
                Object.keys(chapters).forEach((key, index) => {
                    chlabels.push(chapters[key])
                    var ch = '<div class="btn btn-md endsession" style="white-space: nowrap; margin-bottom: 5px" onclick="goToChapter(' + key + ')">' + chapters[key] + ' ' + secondsToMinutes(key) + '</div>';
                    $('#chapters').append(ch);
                    var next;
                    if (index == keys.length - 1) {
                        next = video.duration
                    } else {
                        next = keys[index + 1]
                    }
                    if (reactions) {
                        var li = 0;
                        var di = 0;
                        var ci = 0;
                        reactions.forEach(reaction => {
                            if (reaction.type == 'like' && reaction.at_second >= key && reaction.at_second < next) {
                                li++
                            } else if (reaction.type == 'dislike' && reaction.at_second >= key && reaction.at_second < next) {
                                di++
                            } else if (reaction.at_second < next && reaction.at_second >= key) {
                                ci++
                            }
                        })
                        res.l.push(li)
                        res.d.push(di)
                        res.c.push(ci)

                    }
                })
                displayReactions(res)
            }

            $('#seconds').append(' (Max ' + secondsToMinutes(duration) + ')');
            if (sliders) {
                sliders.forEach((slider, index) => {
                    avgApp += slider.appreciation;
                    avgUnd += slider.understanding;
                    if (slider.user_name.includes('@'))
                        logged += 1;
                })
                avgApp /= sliders.length;
                $('#avgAppreciation').append(' ' + Math.round(avgApp) + '/100 <br>Appreciation')
                avgUnd /= sliders.length;
                $('#avgUnderstanding').append(' ' + Math.round(avgUnd) + '/100 <br>Understanding')
            }
            if (reactions) {
                reactions.forEach(reaction => {
                    if (reaction.type == 'like') {
                        l.push(reaction.at_second)
                    } else if (reaction.type == 'dislike') {
                        d.push(reaction.at_second)
                    } else {
                        co.push(reaction)
                        c.push(reaction.at_second)
                    }
                })
            }
            generateChart(l, d, c, duration)
            createSortedTable();
            $('#reacTot').append(reactions.length)
            $('#studTot').append(sliders.length)
            $('#logged').append(logged + '<br>')
            $('#logged').append('<div>Logged-in </div>')
            $('#anonym').append((sliders.length - logged) + '<br>')
            $('#anonym').append('<div>Anonymous </div>')
            $('#comm').append(c.length + '<br> Comments')
            $('#getIt').append(l.length + '<br> I get it')
            $('#dGetIt').append(d.length + '<br>I don\'t get it')
            $('#loading').hide();
            stat.push(reactions.length, Math.round(avgUnd), Math.round(avgApp), l.length, d.length, c.length)
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });
}


function displayReactions(data) {
    const config = {
        type: 'bar',
        data: {
            labels: chlabels,
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

            }
        }
    };
    var chart = new Chart($('#chpchart'), config);
}



function downloadUniqueFile() {
    html2canvas($('#chartRow')[0]).then(canvas => {
        $.ajax({
            url: './saveImage',
            type: 'post',
            data: {
                name: video.title,
                chart: canvas.toDataURL('image/jpeg', 0.5)
            },
            success: function(data) {
                axios({
                    url: './download',
                    method: 'post',
                    responseType: 'blob',
                    data: {
                        name: video.title,
                        comments: JSON.stringify(co),
                        stat: JSON.stringify(stat),
                    }
                }).then(response => {
                    let headerLine = response.headers['content-disposition'];
                    let startFileNameIndex = headerLine.indexOf('"') + 1
                    let endFileNameIndex = headerLine.lastIndexOf('"')
                    let filename = headerLine.substring(startFileNameIndex, endFileNameIndex)
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                    const link = document.createElement('a');

                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                }).catch(error => {
                    console.log(error)
                })
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                console.log(errorMessage);
            },
        })
    });

}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


function createSortedTable() {
    $('#commentsTable > tbody').empty()
    co.sort(GetSortOrder("at_second"))
    co.forEach((comment, key) => {
        var newEntry = '<tr> \
                <td style="cursor: pointer" class="t" id="' + key + '" data-toggle="modal" data-target="#seeFullFeadback" onclick="addText(' + key + ')" >' + htmlEntities(comment.type) + '</td>\
                <td class="t" ><button class="btn btn-md endsession"  onclick="goToSecond(' + comment.at_second + ')">' + secondsToMinutes(comment.at_second) + '</button></td>\
                </tr>';
        $('#commentsTable > tbody').append(newEntry);

    })
    $('tr td:first-child').css({
        maxWidth: $('th:first-child').outerWidth(),
        width: $('th:first-child').outerWidth()
    })
    $('tr td:last-child').css({
        width: $('th:last-child').outerWidth()
    })
}

function GetSortOrder(prop) {
    return function(a, b) {
        return a[prop] - b[prop];
    }
}

function goToSecond(second) {
    if (second < 10) {
        player.seekTo(0);
        player.playVideo();
    } else {
        player.seekTo(second - 10);
        player.playVideo();
    }
}

function goToChapter(second) {
    player.seekTo(second);
    var keys = Object.keys(chapters);
    var nextIndex = keys.indexOf(String(second)) + 1;
    start = second
    if (keys[nextIndex]) {

        end = Number(keys[nextIndex]);
    } else {
        console.log('duration', duration)
        end = duration;
    }


    focus = true;
    chart.destroy();
    focusOnChapter(l, d, c, second, end)
}



function customFocus() {
    start = Number($('#sh').val()) * 3600 + Number($('#sm').val()) * 60 + Number($('#ss').val())
    end = Number($('#endh').val()) * 3600 + Number($('#endm').val()) * 60 + Number($('#ends').val())
    if (isNaN($('#sh').val()) || isNaN($('#sm').val()) || isNaN($('#ss').val()) || isNaN($('#endh').val()) || isNaN($('#endm').val()) || isNaN($('#ends').val())) {
        $('#intError').empty()
        $('#intError').text('Input must be a number ')
        $('#sh').val('')
        $('#sm').val('')
        $('#ss').val('')
        $('#endh').val('')
        $('#endm').val('')
        $('#ends').val('')
    } else {
        if ($('#sh').val() < 0 || $('#sh').val() > 24 || $('#sm').val() < 0 || $('#sm').val() > 60 || $('#ss').val() < 0 || $('#ss').val() > 60 || $('#endh').val() < 0 || $('#endh').val() > 24 || $('#endm').val() < 0 || $('#endm').val() > 60 || $('#ends').val() < 0 || $('#ends').val() > 60) {
            $('#intError').empty()
            $('#intError').text('Input out of bound (0<=HH<=24, 0<=MM<=60, 0<=SS<=60 ')
            $('#sh').val('')
            $('#sm').val('')
            $('#ss').val('')
            $('#endh').val('')
            $('#endm').val('')
            $('#ends').val('')
        } else {
            if (start < end) {
                if (end > duration) {
                    $('#intError').empty()
                    $('#intError').text('The ending point should be less or equal then the video duration')
                    $('#sh').val('')
                    $('#sm').val('')
                    $('#ss').val('')
                    $('#endh').val('')
                    $('#endm').val('')
                    $('#ends').val('')
                } else {
                    $('#intError').empty()
                    focus = true;
                    chart.destroy();
                    $('#sh').val('')
                    $('#sm').val('')
                    $('#ss').val('')
                    $('#endh').val('')
                    $('#endm').val('')
                    $('#ends').val('')
                    focusOnChapter(l, d, c, start, end)
                }
            } else {
                $('#intError').empty()
                $('#intError').text('The starting point should be less then the ending point')
                $('#sh').val('')
                $('#sm').val('')
                $('#ss').val('')
                $('#endh').val('')
                $('#endm').val('')
                $('#ends').val('')
            }
        }
    }
}

function focusOnChapter(l, d, c, start, end) {
    var l = l.filter(time => time >= start && time < end);
    var d = d.filter(time => time >= start && time < end);
    var c = c.filter(time => time >= start && time < end);
    var ctx = document.getElementById('chart').getContext('2d');
    var labels = [];
    var duration = end - start;
    segmentsLength = Math.ceil(duration / numSegments);
    feedBackInThatSegment = []
    for (var i = start; i < end; i = i + segmentsLength) {
        feedBackInThatSegment.push(secondsToMinutes(i));
        var med = Math.round((i + i + segmentsLength) / 2)
        labels.push(secondsToMinutes(med));
    }
    labels.push('zoom');
    var likesMap = fillMap(l, start, end);
    var dislikesMap = fillMap(d, start, end);
    var commentsMap = fillMap(c, start, end);
    var maxValue = getMaxYValue(likesMap, dislikesMap, commentsMap);
    likesMap.push({
        x: end + 100,
        y: 0,
        t: ['zoom']
    })
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: '\uf118',
                    data: likesMap,
                    fill: false,
                    borderColor: '#253D70',
                    backgroundColor: pattern.draw('zigzag', 'rgba(37, 61, 112, 0.9)'),
                    stack: 'Stack 0',

                },
                {
                    label: '\uf119',
                    data: dislikesMap,
                    borderColor: '#F1B467',
                    backgroundColor: pattern.draw('disc', 'rgba(241, 179, 103, 0.9)'),
                    stack: 'Stack 0',
                },
                {
                    label: '\uf128',
                    data: commentsMap,
                    borderColor: '#f01166',
                    backgroundColor: pattern.draw('diamond', 'rgba(240, 15, 101, 0.75)'),
                    stack: 'Stack 0',
                },
            ],
        },

        options: {
            plugins: {
                htmlLegend: {
                    // ID of the container to put the legend in
                    containerID: 'legend',
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                    position: 'nearest',
                    external: externalTooltipHandler
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

                    stacked: true,
                    min: 0,
                    max: 24,

                },
                y: {
                    suggestedMax: maxValue + 2,
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'point'
            },
            onClick: function(e) {
                var activePoint = chart.getElementsAtEventForMode(e, 'point', { intersect: true }, false);
                if (activePoint.length > 0) {
                    var point = activePoint[0].index;
                    var label = chart.data.datasets[0].data[point];
                    var sec = label[Object.keys(label)[0]]
                    goToSecond(sec);
                }
            }

        },
        plugins: [htmlLegendPlugin],
    };
    chart = new Chart(ctx, config);
}


function addText(key) {
    $("#fedbackBox").attr('name', key);
    $('#timeFeed button').remove();
    $('#timeFeed').append('<button class="btn btn-md endsession">' + secondsToMinutes(co[key].at_second) + "</button>")
    $("#fedbackBox").val(htmlEntities(co[key].type));

    if (key == 0) {
        $('#prev').hide()
    }
    if (key == co.length - 1) {
        $('#next').hide()
    }
}

function prevComment() {
    var key = Number($("#fedbackBox").attr('name')) - 1;

    if (key > 0) {
        $('#next').show()
        $("#fedbackBox").attr('name', key);
        $('#timeFeed button').remove();
        $('#timeFeed').append('<button class="btn btn-md endsession">' + secondsToMinutes(co[key].at_second) + "</button>")
        $("#fedbackBox").val(htmlEntities(co[key].type));
    } else {
        $("#fedbackBox").attr('name', key);
        $('#timeFeed button').remove();
        $('#timeFeed').append('<button class="btn btn-md endsession">' + secondsToMinutes(co[key].at_second) + "</button>")
        $("#fedbackBox").val(htmlEntities(co[key].type));
        $('#prev').hide()
    }

}

function nextComment() {
    var key = Number($("#fedbackBox").attr('name')) + 1;
    if (key < co.length - 1) {
        $('#prev').show()
        $("#fedbackBox").attr('name', key);
        $('#timeFeed button').remove();
        $('#timeFeed').append('<button class="btn btn-md endsession">' + secondsToMinutes(co[key].at_second) + "</button>")
        $("#fedbackBox").val(htmlEntities(co[key].type));
    } else {
        $("#fedbackBox").attr('name', key);
        $('#timeFeed button').remove();
        $('#timeFeed').append('<button class="btn btn-md endsession">' + secondsToMinutes(co[key].at_second) + "</button>")
        $("#fedbackBox").val(htmlEntities(co[key].type));
        $('#next').hide()
    }
}

$('#timeFeed').on('click', () => {
    goToSecond(co[$("#fedbackBox").attr('name')].at_second)
})


$('#seeFullFeadback').modal({
    backdrop: false,
    show: false
})

if ($(window).width() < 850) {
    $('#seeFullFeadback').css({
        top: window.screen.height / 3,
        left: window.screen.width / 4,
    })
} else {
    $('#seeFullFeadback').css({
        top: window.screen.height / 3,
        left: window.screen.width / 1.8,
    })
}
$(window).resize(() => {
    if ($(window).width() < 850) {
        $('#seeFullFeadback').css({
            top: window.screen.height / 3,
            left: window.screen.width / 4,
        })
    } else {
        $('#seeFullFeadback').css({
            top: window.screen.height / 3,
            left: window.screen.width / 1.8,
        })
    }
})

function createConfig(l, d, c, duration) {
    segmentsLength = Math.ceil(duration / numSegments);

    for (var i = 0; i < duration; i = i + segmentsLength) {
        feedBackInThatSegment.push(secondsToMinutes(i));
        var med = Math.round((i + i + segmentsLength) / 2)
        Xlabels.push(secondsToMinutes(med));
    }
    Xlabels.push('zoom');
    var likesMap = fillMap(l, 0, duration);
    var dislikesMap = fillMap(d, 0, duration);
    var commentsMap = fillMap(c, 0, duration);
    var maxValue = getMaxYValue(likesMap, dislikesMap, commentsMap);
    likesMap.push({
        x: duration + 100,
        y: 0,
        t: ['zoom']
    })
    return {
        type: 'bar',
        data: {
            labels: Xlabels,
            datasets: [{
                    label: '\uf118',
                    data: likesMap,
                    fill: false,
                    borderColor: '#253D70',
                    backgroundColor: pattern.draw('zigzag', 'rgba(37, 61, 112, 0.9)'),
                    stack: 'Stack 0',

                },
                {
                    label: '\uf119',
                    data: dislikesMap,
                    borderColor: '#F1B467',
                    backgroundColor: pattern.draw('disc', 'rgba(241, 179, 103, 0.9)'),
                    stack: 'Stack 0',
                },
                {
                    label: '\uf128',
                    data: commentsMap,
                    borderColor: '#f01166',
                    backgroundColor: pattern.draw('diamond', 'rgba(240, 15, 101, 0.75)'),
                    stack: 'Stack 0',
                },
            ],
        },

        options: {
            plugins: {
                htmlLegend: {
                    // ID of the container to put the legend in
                    containerID: 'legend',
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                    position: 'nearest',
                    external: externalTooltipHandler
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

                    stacked: true,
                    min: 0,
                    max: 24,

                },
                y: {
                    suggestedMax: maxValue + 2,
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'point'
            },
            onClick: function(e) {
                var activePoint = chart.getElementsAtEventForMode(e, 'point', { intersect: true }, false);
                if (activePoint.length > 0) {
                    var point = activePoint[0].index;
                    var label = chart.data.datasets[0].data[point];
                    var sec = label[Object.keys(label)[0]]
                    goToSecond(sec);
                }
            }

        },
        plugins: [htmlLegendPlugin],
    };
}

const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('ul');

    if (!listContainer) {
        listContainer = document.createElement('ul');
        listContainer.style.display = 'flex';
        listContainer.style.flexDirection = 'column';
        listContainer.style.margin = 0;
        listContainer.style.padding = 0;

        legendContainer.appendChild(listContainer);
    }

    return listContainer;
};

var legendState = [true, true, true];
var htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        const ul = getOrCreateLegendList(chart, options.containerID);
        // Remove old legend items
        while (ul.firstChild) {
            ul.firstChild.remove();

        }

        // Reuse the built-in legendItems generator
        const items = chart.options.plugins.legend.labels.generateLabels(chart);
        var tooltips = ['I get it', 'I don\' t get it', 'Comment']
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.title = tooltips[index]
                //li.style.alignItems = 'center';
            li.style.verticalAlign = 'middle';
            //first combination
            li.style.display = 'table-cell';
            li.style.marginLeft = '15px';
            //second and third combination
            // li.style.display = 'flex';
            // li.style.flexDirection = 'row';

            // li.style.marginLeft = '10px';




            // Color box
            const boxSpan = document.createElement('img');
            boxSpan.height = 20;
            boxSpan.width = 20;
            boxSpan.style.marginLeft = '1.5px';
            boxSpan.style.marginRight = '1.5px';
            if (item.datasetIndex == 0) {
                boxSpan.src = "../images/likePattern.png";
            } else if (item.datasetIndex == 1) {
                boxSpan.src = "../images/dislikePattern.png";
            } else {
                boxSpan.src = "../images/questionPattern.png";
            }


            var checkbox = document.createElement('div');
            var input = document.createElement('input');
            var span = document.createElement('span');
            checkbox.setAttribute("class", 'switch');
            input.setAttribute('type', 'checkbox');
            input.setAttribute('id', 'a' + index);

            span.setAttribute('class', 'slider round')
            chart.setDatasetVisibility(index, legendState[index]);
            if (chart.isDatasetVisible(item.datasetIndex)) {
                input.checked = true;
            }




            checkbox.appendChild(input);
            checkbox.appendChild(span);
            checkbox.onclick = () => {
                legendState[index] = !chart.isDatasetVisible(item.datasetIndex);
                chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));

                chart.update();;



            };


            var image = document.createElement('img');
            // first setting
            //image.style.verticalAlign = 'unset';
            image.style.paddingLeft = '3px';
            //second setting
            //image.style.paddingLeft = '3px';
            // //third setting
            // image.style.paddingLeft = '2px';
            // boxSpan.style.paddingLeft = '2px';
            image.height = 20;
            if (item.datasetIndex == 0) {
                image.src = "../images/happy3.png";
            } else if (item.datasetIndex == 1) {
                image.src = "../images/sad3.png";
            } else {
                image.src = "../images/question.png";
            }



            li.appendChild(image);
            li.appendChild(boxSpan);
            li.appendChild(checkbox);

            ul.appendChild(li);

        });

    }
};

const getOrCreateTooltip = (chart) => {

    let tooltipEl = document.getElementById('tooltip') //chart.canvas.querySelector('div');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.setAttribute('id', 'tooltip')
        tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
        tooltipEl.style.borderRadius = '3px';
        tooltipEl.style.color = 'white';
        tooltipEl.style.opacity = 1;
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transition = 'all .1s ease';
        chart.canvas.parentNode.appendChild(tooltipEl);
    } else {
        tooltipEl.innerHTML = '';
    }

    return tooltipEl;
};

const externalTooltipHandler = (context) => {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.remove();
        return;
    }

    // Set Text
    if (tooltip.body) {
        if (feedBackInThatSegment[tooltip.dataPoints[0].dataIndex + 1] != null) {
            var text = feedBackInThatSegment[tooltip.dataPoints[0].dataIndex] + '-' + feedBackInThatSegment[tooltip.dataPoints[0].dataIndex + 1];
        } else {
            var text = feedBackInThatSegment[tooltip.dataPoints[0].dataIndex] + '-' + secondsToMinutes(duration);
        }
        const bodyLines = tooltip.body.map(b => b.lines);

        const title = document.createElement('h7')
        title.style.fontWeight = 'bold';
        var texts = document.createTextNode(text);
        title.appendChild(texts);



        const tableBody = document.createElement('tbody');
        bodyLines.forEach((body, i) => {

            const span = document.createElement('span');
            span.style.borderWidth = '2px';
            span.style.marginRight = '10px';
            span.style.height = '18px';
            span.style.width = '18px';
            span.style.display = 'inline-block';

            const image = document.createElement('img');
            image.height = 18;
            if (tooltip.dataPoints[0].datasetIndex == 0) {
                image.src = "../images/happy3.png";
            } else if (tooltip.dataPoints[0].datasetIndex == 1) {
                image.src = "../images/sad3.png";
            } else {
                image.src = "../images/question.png";
            }
            const boxSpan = document.createElement('img');
            boxSpan.height = 18;
            boxSpan.width = 18;
            boxSpan.style.marginRight = '5px';
            if (tooltip.dataPoints[0].datasetIndex == 0) {
                boxSpan.src = "../images/likePattern.png";
            } else if (tooltip.dataPoints[0].datasetIndex == 1) {
                boxSpan.src = "../images/dislikePattern.png";
            } else {
                boxSpan.src = "../images/questionPattern.png";
            }

            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;

            const td = document.createElement('td');
            td.style.borderWidth = 0;

            const text = document.createTextNode('  Tot: ' + tooltip.dataPoints[0].formattedValue);

            td.appendChild(boxSpan);
            td.appendChild(image);
            td.appendChild(text);
            tr.appendChild(td);
            tableBody.appendChild(tr);
        });


        // Add new children
        tooltipEl.appendChild(title);
        tooltipEl.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;

    if (tooltip.caretX < 550) {
        tooltipEl.style.left = positionX + tooltip.caretX + 60 + 'px';
        tooltipEl.setAttribute('class', 'leftTooltip');

    } else {
        tooltipEl.style.left = positionX + tooltip.caretX - 80 + 'px';
        tooltipEl.setAttribute('class', 'rigthTooltip');
    }
    tooltipEl.style.top = positionY + tooltip.caretY - 20 + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';

};



function generateChart(l, d, c, duration) {
    var ctx = document.getElementById('chart').getContext('2d');
    var config = createConfig(l, d, c, duration);
    chart = new Chart(ctx, config);

}

function secondsToMinutes(s) {
    var h = Math.floor(s / 3600); //Get whole hours
    s -= h * 3600;
    var m = Math.floor(s / 60); //Get remaining minutes
    s -= m * 60;
    if (h == 0) {
        return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
    } else {
        return h + ":" + (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
    }
}

function fillMap(array, start, duration) {
    var map = {};
    var time = {}
    var len = array.length
    if (array.length === 0) {
        len = 1;
    }
    for (var i = 0; i < len; i++) {
        for (var j = start; j < duration; j += segmentsLength) {
            if (!map[j]) {
                map[j] = 0;
                time[j] = [];
            }
            if (array[i] >= j && array[i] < j + segmentsLength) {
                map[j] += 1;
                time[j].push(secondsToMinutes(array[i]))
            }
        }

    }

    var point_data = [];
    for (var j = start; j < duration; j += segmentsLength) {
        point_data.push({
            x: j,
            y: map[j],
            t: time[j]
        });
    }
    return point_data;
}

function getMaxYValue(l, d, c) {
    var max = 0;
    for (var i = 0; i < l.length; i++) {
        var temp_max = l[i].y + d[i].y + c[i].y;

        if (temp_max > max) {
            max = temp_max;
        }
    }
    return max;
};

function resetZoom() {
    chart.resetZoom();
}

function returnFirstChart() {
    $('.chartInfo').remove();
    $('.popover').remove();
    feedBackInThatSegment = [];
    Xlabels = [];
    zoomAtTheMoment = 1;
    numSegments = 24;
    chart.destroy();
    focus = false;
    generateChart(l, d, c, duration);
}

function zoomInChart() {
    $('#chartControl .zoomIn').popover('dispose')
    $('#smallChart .zoomIn').popover('dispose')
    $('.chartInfo').remove()
    if (zoomAtTheMoment < 4) {

        feedBackInThatSegment = [];
        Xlabels = [];
        numSegments *= 2;
        zoomAtTheMoment++;
        chart.destroy();
        if (focus) {
            focusOnChapter(l, d, c, start, end)
        } else {
            generateChart(l, d, c, duration);
        }

        var chartPos = $("#chart").position();
        $('#chartRow').append('<div class="chartInfo cirigth row justify-content-center" ><div class="col-12 d-flex justify-content-center align-items-center"><h2>Click and drag to navigate the chart</h2></div><div class="col-12 d-flex justify-content-center"><span ><img src="../images/left-arrow.png" height="40px" width="40px"><img class="mouse" src="../images/mouse.png" height="80px" width="80px"><img src="../images/right-arrow.png" height="40px" width="40px"> </span></div></div>')
        $('.cirigth').css({ top: chartPos.top, rigth: '3.5vw', width: '85%', height: '85%' })
        setTimeout(function() {
            $('.chartInfo').remove()
        }, 2000);
    } else {



        $('#chartControl .zoomIn').popover({
            placement: "top",
            content: 'Maximum reached'
        }).popover('show')
        setTimeout(function() {
            $('#chartControl .zoomIn').popover('dispose')
        }, 2000);

    }
}


function zoomOutChart() {
    $('#chartControl .zoomOut').popover('dispose')
    $('#smallChart .zoomOut').popover('dispose')
    $('.chartInfo').remove()
    if (zoomAtTheMoment > 0) {

        feedBackInThatSegment = [];
        Xlabels = [];
        numSegments /= 2;
        zoomAtTheMoment--;
        chart.destroy();
        if (focus) {
            focusOnChapter(l, d, c, start, end)
        } else {
            generateChart(l, d, c, duration);
        }
        var chartPos = $("#chart").position();
        $('#chartRow').append('<div class="chartInfo cirigth row justify-content-center" ><div class="col-12 d-flex justify-content-center align-items-center"><h2>Click and drag to navigate the chart</h2></div><div class="col-12 d-flex justify-content-center"><span ><img src="../images/left-arrow.png" height="40px" width="40px"><img class="mouse" src="../images/mouse.png" height="80px" width="80px"><img src="../images/right-arrow.png" height="40px" width="40px"> </span></div></div>')
        $('.cirigth').css({ top: chartPos.top, rigth: '3.5vw', width: '85%', height: '85%' })
        setTimeout(function() {
            $('.chartInfo').remove()
        }, 2000);
    } else {

        $('#chartControl .zoomOut').popover({
            placement: "top",
            content: 'Maximum reached '
        }).popover('show')
        setTimeout(function() {
            $('#chartControl .zoomOut').popover('dispose')
        }, 2000);

    }
}






$(document).ready(() => {
    if ($(window).width() < 1200) {
        $('#content').css({ width: '1200px' })
        $('#wrap').css({ width: '1900px' })
    }

})

$(window).resize(() => {
    createSortedTable();
    if ($(window).width() < 1200) {
        $('#content').css({ width: '1200px' })
        $('#wrap').css({ width: '1900px' })
        var n = 1.25
        if (Object.keys(chapters).length > 10) {
            n = 2
        }
        if (Object.keys(chapters).length > 15) {
            n = 2.5
        }
        if (Object.keys(chapters).length > 20) {
            n = 3.5
        }
        if (Object.keys(chapters).length > 25) {
            n = 4
        }

        $('#chapters').css({ width: window.screen.width * n })
        $('#chRow').css({ width: window.screen.width })

    } else {
        $('#content').css({ width: 'auto' })
        var n = 1
        if (Object.keys(chapters).length > 10) {
            n = 2
        }
        if (Object.keys(chapters).length > 15) {
            n = 2.5
        }
        if (Object.keys(chapters).length > 20) {
            n = 3.5
        }
        if (Object.keys(chapters).length > 25) {
            n = 4
        }

        $('#chapters').css({ width: window.screen.width * n })
        $('#chRow').css({ width: window.screen.width })

    }



})