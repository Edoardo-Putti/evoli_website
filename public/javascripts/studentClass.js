var likesNum = 0;
var dislikesNum = 0;
var commemtsNum = 0;
var commentsLocal = {};
var sliderId;
var understanding = $("#clarity");
var understandingValue = $("#clarityValue");
var logged = false;
var appreciation = $("#appreciation");
var appreciationValue = $("#appreciationValue");
var full = false;
var reactionIds = [];
var confirmed = false;
var reactionAnonim = [];
var sliderAnonim = {
    appreciation: 50,
    understanding: 50
};

$(() => {
    $.ajax({
        url: "http://localhost:8000/student/getFeedbacks",
        type: 'get',
        success: function(data, status) {
            logged = true;
            $('#end').attr("data-target", "#logged");
            var reactions = data.res.reaction;
            var slider = data.res.slider
            sliderId = slider.sid;
            understandingValue.html(slider.understanding + "/100");
            understanding.val(slider.understanding);
            appreciationValue.html(slider.appreciation + "/100");
            appreciation.val(slider.appreciation);

            if (reactions) {
                reactions.forEach(reaction => {
                    reactionIds.push(reaction.rid);
                    var code = 'a' + reaction.rid;
                    if (reaction.type === 'like') {
                        likesNum++;
                        $("#likesCount").text(likesNum);
                        var newContent = '<tr id="' + code + '">' +
                            '<td> I GET IT </td>' +
                            '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + reaction.at_second + ')">' + secondsToMinutes(reaction.at_second) + '</button></td>' +
                            '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                            +'</tr>';
                        $('#likesArray').append(newContent)
                    } else if (reaction.type === 'dislike') {
                        dislikesNum++;
                        $("#dislikesCount").text(dislikesNum);
                        var newContent = '<tr id="' + code + '">' +
                            '<td> I DON\'T GET IT </td>' +
                            '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + reaction.at_second + ')">' + secondsToMinutes(reaction.at_second) + '</button></td>' +
                            '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                            +'</tr>';
                        $('#dislikesArray').append(newContent)
                    } else {
                        commemtsNum++;
                        $("#commentsCount").text(commemtsNum);
                        commentsLocal[code] = reaction.type;
                        var newContent = '<tr id="' + code + '">' +
                            '<td>' + reaction.type + '</td>' +
                            '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + reaction.at_second + ')">' + secondsToMinutes(reaction.at_second) + '</button></td>' +
                            '<td><button class="btn btn-md endsession"  data-toggle="modal" data-target="#editComment" onclick="editComment(' + code + ')">Edit</button></td>' +
                            '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                            +'</tr>';
                        $('#commentsArray').append(newContent)
                    }
                })
            }

            $('#loading').hide();
        },
        error: function(data, status) {

            $('#end').attr("data-target", "#anonim");
            if (sessionStorage.getItem("sessionAnonim")) {
                reactionAnonim = JSON.parse(sessionStorage.getItem("sessionAnonim"));
                reactionAnonim.forEach(reaction => {
                    reactionIds.push(reaction.rid);
                    var code = reaction.rid;
                    if (reaction.type === 'like') {
                        likesNum++;
                        $("#likesCount").text(likesNum);
                        var newContent = '<tr id="' + code + '">' +
                            '<td> I GET IT </td>' +
                            '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + reaction.at_second + ')">' + secondsToMinutes(reaction.at_second) + '</button></td>' +
                            '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                            +'</tr>';
                        $('#likesArray').append(newContent)
                    } else if (reaction.type === 'dislike') {
                        dislikesNum++;
                        $("#dislikesCount").text(dislikesNum);
                        var newContent = '<tr id="' + code + '">' +
                            '<td> I DON\'T GET IT </td>' +
                            '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + reaction.at_second + ')">' + secondsToMinutes(reaction.at_second) + '</button></td>' +
                            '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                            +'</tr>';
                        $('#dislikesArray').append(newContent)
                    } else {
                        commemtsNum++;
                        $("#commentsCount").text(commemtsNum);
                        commentsLocal[code] = reaction.type;
                        var newContent = '<tr id="' + code + '">' +
                            '<td>' + reaction.type + '</td>' +
                            '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + reaction.at_second + ')">' + secondsToMinutes(reaction.at_second) + '</button></td>' +
                            '<td><button class="btn btn-md endsession"  data-toggle="modal" data-target="#editComment" onclick="editComment(' + code + ')">Edit</button></td>' +
                            '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                            +'</tr>';
                        $('#commentsArray').append(newContent)
                    }
                })
            }
            if (sessionStorage.getItem('sliderAnonim')) {
                sliderAnonim = JSON.parse(sessionStorage.getItem('sliderAnonim'))
                understanding.val(sliderAnonim.understanding);
                appreciation.val(sliderAnonim.appreciation);
            } else {
                understanding.val(sliderAnonim.understanding);
                appreciation.val(sliderAnonim.appreciation);

            }
            $("#likesCount").text(likesNum);
            $("#dislikesCount").text(dislikesNum);
            $("#commentsCount").text(commemtsNum);
            understandingValue.html(understanding.val() + "/100");
            appreciationValue.html(appreciation.val() + "/100");
            $('#loading').hide();
        }

    })
})

// Update the current slider value (each time you drag the slider handle)
appreciation.on('input', function() {
    appreciationValue.html(appreciation.val() + "/100");

});


// Update the current slider value (each time you drag the slider handle)
understanding.on('input', function() {
    understandingValue.html(understanding.val() + "/100");
});

//when the value is changed send it to the db or update it if already sent
appreciation.on('change', function() {
    if (logged) {
        $.ajax({
            url: "http://localhost:8000/student/updateSlider",
            type: 'post',
            data: {
                value: appreciation.val(),
                sid: sliderId,
                type: false
            },
            success: function(data, status) {
                console.log(data.done)
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                console.log(errorMessage);
            },
        });
    } else {
        sliderAnonim.appreciation = appreciation.val();
        sessionStorage.setItem('sliderAnonim', JSON.stringify(sliderAnonim));
    }

});


// //when the value is changed send it to the db or update it if already sent
understanding.on('change', function() {
    if (logged) {
        $.ajax({
            url: "http://localhost:8000/student/updateSlider",
            type: 'post',
            data: {
                value: understanding.val(),
                sid: sliderId,
                type: true,
            },
            success: function(data, status) {
                console.log(data.done)
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                console.log(errorMessage);
            },
        });
    } else {
        sliderAnonim.understanding = understanding.val();
        sessionStorage.setItem('sliderAnonim', JSON.stringify(sliderAnonim));
    }
});



function addLike() {
    var sec = parseInt(getSecond())
    if (likesNum == 0) {
        $('#likesArray').html('<thead><tr><th scope="col">Reaction</th><th scope="col">Minute</th><th scope="col">Delete</th></tr></thead><tbody></tbody>');
        $('#likesArray').removeClass('noReaction');
    }
    $.ajax({
        url: "http://localhost:8000/student/newReaction",
        type: 'post',
        data: {
            type: 'like',
            second: sec
        },
        success: function(data, status) {
            reactionIds.push(data.reaction.rid);
            var code = 'a' + data.reaction.rid;
            if (!logged) {
                var reaction = {
                    rid: code,
                    type: 'like',
                    at_second: sec,
                    visible: 0
                }
                reactionAnonim.push(reaction);
                sessionStorage.setItem('sessionAnonim', JSON.stringify(reactionAnonim));
            }
            likesNum++;
            $("#likesCount").text(likesNum);
            var newContent = '<tr id="' + code + '">' +
                '<td> I GET IT </td>' +
                '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + sec + ')">' + secondsToMinutes(sec) + '</button></td>' +
                '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                +'</tr>';
            $('#likesArray').append(newContent)
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });




}

function addDislike() {
    var sec = parseInt(getSecond())
    if (dislikesNum == 0) {
        $("#dislikesArray").removeClass('noReaction');
        $("#dislikesArray").html('<thead><tr><th scope="col">Reaction</th><th scope="col">Minute</th><th scope="col">Delete</th></tr></thead><tbody></tbody>');

    }
    $.ajax({
        url: "http://localhost:8000/student/newReaction",
        type: 'post',
        data: {
            type: 'dislike',
            second: sec

        },
        success: function(data, status) {
            reactionIds.push(data.reaction.rid);
            var code = 'a' + data.reaction.rid;
            if (!logged) {
                var reaction = {
                    rid: code,
                    type: 'dislike',
                    at_second: sec,
                    visible: 0
                }
                reactionAnonim.push(reaction);
                sessionStorage.setItem('sessionAnonim', JSON.stringify(reactionAnonim));
            }
            dislikesNum++;
            $("#dislikesCount").text(dislikesNum);
            var newContent = '<tr id="' + code + '">' +
                '<td> I DON\'T GET IT </td>' +
                '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + sec + ')">' + secondsToMinutes(sec) + '</button></td>' +
                '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                +'</tr>';

            $('#dislikesArray').append(newContent)
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });


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



function getSecond() {
    var time = parseInt(player.getCurrentTime());
    return time;
}


function openForm() {
    $("#commentBox").val('');
    player.pauseVideo();
}

$('#question').on('hide.bs.modal', function(e) {
    player.playVideo();
});

function closeForm() {
    var sec = parseInt(getSecond())
    if (commemtsNum == 0) {
        $('#commentsArray').removeClass('noReaction');
        $('#commentsArray').html('<thead><tr><th scope="col">Reaction</th><th scope="col">Minute</th><th scope="col">Modify</th><th scope="col">Delete</th></tr></thead><tbody></tbody>');
    }
    $.ajax({
        url: "http://localhost:8000/student/newReaction",
        type: 'post',
        data: {
            type: $.trim($('#commentBox').val()),
            second: sec
        },
        success: function(data, status) {
            reactionIds.push(data.reaction.rid);
            var code = 'a' + data.reaction.rid;
            if (!logged) {

                var reaction = {
                    rid: code,
                    type: $.trim($('#commentBox').val()),
                    at_second: sec,
                    visible: 0
                }
                reactionAnonim.push(reaction);
                sessionStorage.setItem('sessionAnonim', JSON.stringify(reactionAnonim));
            }
            commemtsNum++;
            $("#commentsCount").text(commemtsNum);
            comment = $.trim($('#commentBox').val());
            commentsLocal[code] = comment;
            var newContent = '<tr id="' + code + '">' +
                '<td>' + comment + '</td>' +
                '<td><button class="btn btn-md endsession"  onclick="goToSecond(' + sec + ')">' + secondsToMinutes(sec) + '</button></td>' +
                '<td><button class="btn btn-md endsession"  data-toggle="modal" data-target="#editComment" onclick="editComment(' + code + ')">Edit</button></td>' +
                '<td ><button class="btn btn-md endsession"  onclick="remove(' + code + ')"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button></td>' +
                +'</tr>';
            $('#commentsArray').append(newContent)
            setTimeout(function() {
                $('#question').modal('hide');
                player.playVideo();
            }, 600);
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });

    return false;
}


function remove(code) {
    var type = $.trim($('#' + code.id + ' > td:first-child').html());
    $.ajax({
        url: "http://localhost:8000/student/deleteReaction",
        type: 'post',
        data: {
            rid: code.id.substring(1)
        },
        success: function(data, status) {
            code.remove();
            if (!logged) {
                reactionAnonim.forEach((reaction, index, object) => {
                    if (reaction.rid == code.id) {
                        object.splice(index, 1);
                    }
                })
                sessionStorage.setItem('sessionAnonim', JSON.stringify(reactionAnonim));
            }
            if (type === 'I GET IT') {
                likesNum--;
                $("#likesCount").text(likesNum);

                if (likesNum == 0) {
                    $('#likesArray').addClass('noReaction');
                    $('#likesArray').html('<h5>You did not add any "I GET IT".</h5>');
                }


            } else if (type === 'I DON\'T GET IT') {
                dislikesNum--;
                $("#dislikesCount").text(dislikesNum);
                if (dislikesNum == 0) {
                    $('#dislikesArray').addClass('noReaction');
                    $('#dislikesArray').html('<h5>You did not add any "I DO NOT GET IT".</h5>');
                }

            } else {
                commemtsNum--;
                $("#commentsCount").text(commemtsNum);
                if (commemtsNum == 0) {
                    $('#commentsArray').addClass('noReaction');
                    $('#commentsArray').html("<h5>You did not add any comment.</h5>");
                }

            }
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });

}

function editComment(code) {
    $('#commentBoxEdit').val(commentsLocal[code.id]);
    $('#postCommEdited').click(function() {
        updatedComment = $("#commentBoxEdit").val();
        commentsLocal[code.id] = updatedComment;
        $.ajax({
            url: "http://localhost:8000/student/updateComment",
            type: 'post',
            data: {
                comment: updatedComment,
                rid: code.id.substring(1)
            },
            success: function(data, status) {
                $('#' + code.id + ' > td:first-child').empty().append(updatedComment);
                console.log(data.done);
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                console.log(errorMessage);
            },
        })

        $('#editComment').modal('hide');
    });
}



function sendConfirmation() {
    confirmed = true;
    $.ajax({
        url: "http://localhost:8000/student/updateVisibility",
        type: 'post',
        data: {
            sid: sliderId,
            rids: JSON.stringify(reactionIds),
            appreciation: appreciation.val(),
            understanding: understanding.val(),
        },
        success: function(data) {
            sessionStorage.clear();
            document.location.href = 'videoOver';
        },
        error: function(data, status) {
            console.log(data)
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });



}


function updateWatched() {
    confirmed = true;
    sessionStorage.clear();
    document.location.href = 'videoOver';
}







var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        full = true;
        $('nav').addClass('disappear')
        $('#fullscreen').removeClass('col-lg-7  col-xl-8')
        $('#playerTop').addClass('videoFullScreen')
        var h = window.screen.height - 70;
        console.log(h)
        $('#playerTop').css({ height: h, width: window.screen.width })
        var w = window.screen.width / 3.5;
        $('#container').addClass('reactionFullScreen')

        $('#container').append('<button id="disableFullScreen" class="btn btn-md btn-logOut2" onclick="closeFullscreen()" style="margin-left: 15vw;border-radius: 40px;height: 50px; margin-top: 10px; width: 80px;">Exit</button>')
        if ($(window).width() < 500) {
            $('#disableFullScreen').css({ marginLeft: '5vw' })
            $('.reactionFullScreen').css({ top: h - 5, margin: 'auto' })
        } else {
            $('.reactionFullScreen').css({ top: h - 20, right: w, margin: 0 })
        }
        $('#lateral').toggle()
        $('#enableFullScreen').hide()
        $('#enableFullScreenSmall').hide()


    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
        full = true;
        $('nav').addClass('disappear')
        $('#fullscreen').removeClass('col-lg-7  col-xl-8')
        $('#playerTop').addClass('videoFullScreen')
        var h = window.screen.height - 70;
        $('#playerTop').css({ height: h, width: window.screen.width })
        var w = window.screen.width / 3.5;
        $('#container').addClass('reactionFullScreen')

        $('#container').append('<button id="disableFullScreen" class="btn btn-md btn-logOut2" onclick="closeFullscreen()" style="margin-left: 15vw;border-radius: 40px;height: 50px; margin-top: 10px; width: 80px;">Exit</button>')
        if ($(window).width() < 500) {
            $('#disableFullScreen').css({ marginLeft: '5vw' })
            $('.reactionFullScreen').css({ top: h - 5, margin: 'auto' })
        } else {
            $('.reactionFullScreen').css({ top: h - 20, right: w, margin: 0 })
        }
        $('#lateral').toggle()
        $('#enableFullScreen').hide()
        $('#enableFullScreenSmall').hide()
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
        full = true;
        $('nav').addClass('disappear')
        $('#fullscreen').removeClass('col-lg-7  col-xl-8')
        $('#playerTop').addClass('videoFullScreen')
        var h = window.screen.height - 70;
        $('#playerTop').css({ height: $('.reactionFullScreen').position().top, width: window.screen.width })
        var w = window.screen.width / 3.5;
        $('#container').addClass('reactionFullScreen')
        $('.reactionFullScreen').css({ top: h - 20, right: w })
        $('#container').append('<button id="disableFullScreen" class="btn btn-md btn-logOut2" onclick="closeFullscreen()" style="margin-left: 15vw;border-radius: 40px;height: 50px; margin-top: 10px; width: 80px;">Exit</button>')
        if ($(window).width() < 500) {
            $('#disableFullScreen').css({ marginLeft: '5vw' })
            $('.reactionFullScreen').css({ top: h - 5, margin: 'auto' })
        } else {
            $('.reactionFullScreen').css({ top: h - 20, right: w, margin: 0 })
        }

        $('#lateral').toggle()
        $('#enableFullScreen').hide()
        $('#enableFullScreenSmall').hide()

    }
}

elem.addEventListener('fullscreenchange', exitHandler);
elem.addEventListener('webkitfullscreenchange', exitHandler);
elem.addEventListener('mozfullscreenchange', exitHandler);
elem.addEventListener('MSFullscreenChange', exitHandler);

function exitHandler() {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {

        if (document.exitFullscreen) {
            console.log('a')
            $('nav').removeClass('disappear')
            full = false;
            $('#playerTop').removeClass('videoFullScreen')
            $('#playerTop').css({ height: '65vh', width: '95%' })
            $('#container').removeClass('reactionFullScreen')
            $('#fullscreen').addClass('col-lg-7  col-xl-8')
            $('#enableFullScreen').toggle()
            $('#disableFullScreen').toggle()
            $('#lateral').toggle()
            $('#container').children().last().remove();
            if ($(window).width() < 500) {
                $('#enableFullScreenSmall').toggle()
            }


        } else if (document.webkitExitFullscreen) { /* Safari */
            console.log('b')
            $('nav').removeClass('disappear')
            full = false;
            $('#playerTop').removeClass('videoFullScreen')
            $('#playerTop').css({ height: '65vh', width: '95%' })
            $('#container').removeClass('reactionFullScreen')
            $('#fullscreen').addClass('col-lg-7  col-xl-8')
            $('#enableFullScreen').toggle()
            $('#disableFullScreen').toggle()
            $('#lateral').toggle()
            $('#container').children().last().remove();
            if ($(window).width() < 500) {
                $('#enableFullScreenSmall').toggle()
            }

        } else if (document.msExitFullscreen) { /* IE11 */
            console.log('c')
            $('nav').removeClass('disappear')
            full = false;
            $('#playerTop').removeClass('videoFullScreen')
            $('#playerTop').css({ height: '65vh', width: '95%' })
            $('#container').removeClass('reactionFullScreen')
            $('#fullscreen').addClass('col-lg-7  col-xl-8')
            $('#enableFullScreen').toggle()
            $('#disableFullScreen').toggle()
            $('#lateral').toggle()
            $('#container').children().last().remove();
            if ($(window).width() < 500) {
                $('#enableFullScreenSmall').toggle()
            }

        }
    }
}

function closeFullscreen() {

    if (document.exitFullscreen) {

        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */

        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */

        document.msExitFullscreen();
    }
}





function onPlayerReady(event) {
    var l = $('#commentReaction').position().left + $('#commentReaction').position().left / 2.5;
    $('#enableFullScreen').css({ left: l, })
}

$(() => {
    if ($(window).width() < 500) {
        if (!full) {
            $('#enableFullScreenSmall').show()
            $('#enableFullScreen').remove()
        } else {
            var h = window.screen.height - 70;
            $('#playerTop').css({ height: h, width: window.screen.width })
            var w = window.screen.width / 3.5;

            $('#container').addClass('reactionFullScreen')
            $('.reactionFullScreen').css({ top: h, right: w })
        }
    }

})


$(window).resize(() => {

    if ($(window).width() < 500) {
        if (!full) {
            $('#enableFullScreen').remove()
            $('#enableFullScreenSmall').show()
        } else {
            var h = window.screen.height - 70;
            $('#playerTop').css({ height: h, width: window.screen.width })
            var w = window.screen.width / 3.5;

            $('#container').addClass('reactionFullScreen')
            $('.reactionFullScreen').css({ top: h, right: w })
        }
    } else {
        if (!full) {
            $('#enableFullScreenSmall').hide()
            if ($('#enableFullScreen').length == 0) {
                $('#col-reac').append('<button id="enableFullScreen" class="btn btn-md btn-logOut2" onclick="openFullscreen();">Fullscreen</button>')
            }
            var l = $('#commentReaction').position().left + $('#commentReaction').position().left / 2.5;
            $('#enableFullScreen').css({ left: l, })
        } else {
            var h = window.screen.height - 70;
            $('#playerTop').css({ height: h, width: window.screen.width })
            var w = window.screen.width / 3.5;
            $('#container').addClass('reactionFullScreen')
            $('.reactionFullScreen').css({ top: h, right: w })
        }
    }

})

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        console.log('ended')
        $('html, body').animate({
            scrollTop: $("#sliderContainer").offset().top
        }, 1500);
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

function showTable(tableName) {


    if ($(tableName).is(':hidden')) {

        $("#likesArray").hide();
        $("#dislikesArray").hide();
        $("#commentsArray").hide();
        if (tableName == "#likesArray") {
            if (likesNum == 0) {
                $(tableName).addClass('noReaction');
                $(tableName).html('<h5>You did not add any "I GET IT".</h5>');
            }

        } else if (tableName == "#dislikesArray") {
            if (dislikesNum == 0) {
                $(tableName).addClass('noReaction');
                $(tableName).html('<h5>You did not add any "I DO NOT GET IT".</h5>');
            }
        } else if (tableName == "#commentsArray") {
            if (commemtsNum == 0) {
                $(tableName).addClass('noReaction');
                $(tableName).html("<h5>You did not add any comment.</h5>");
            }
        }

        $(tableName).show();


    } else {
        $(tableName).removeClass('noReaction');
        $(tableName).hide();
    }
}


$("#like").click(function() {
    if ($("#dislike > i").hasClass("fa-chevron-up")) {
        $("#dislike > i").removeClass('fa-chevron-up');
        $("#dislike > i").addClass('fa-chevron-down');
    }
    if ($("#comment > i").hasClass("fa-chevron-up")) {

        $("#comment > i").removeClass('fa-chevron-up');
        $("#comment > i").addClass('fa-chevron-down');
    }
    if ($("#like > i").hasClass("fa-chevron-up")) {

        $("#like > i").removeClass('fa-chevron-up');
        $("#like > i").addClass('fa-chevron-down');
    } else {

        $("#like > i").removeClass('fa-chevron-down');
        $("#like > i").addClass('fa-chevron-up');
    }
})

$("#dislike").click(function() {
    if ($("#comment > i").hasClass("fa-chevron-up")) {

        $("#comment > i").removeClass('fa-chevron-up');
        $("#comment > i").addClass('fa-chevron-down');
    }
    if ($("#like > i").hasClass("fa-chevron-up")) {

        $("#like > i").removeClass('fa-chevron-up');
        $("#like > i").addClass('fa-chevron-down');
    }
    if ($("#dislike > i").hasClass("fa-chevron-up")) {

        $("#dislike > i").removeClass('fa-chevron-up');
        $("#dislike > i").addClass('fa-chevron-down');
    } else {

        $("#dislike > i").removeClass('fa-chevron-down');
        $("#dislike > i").addClass('fa-chevron-up');
    }
})

$("#comment").click(function() {
    if ($("#like > i").hasClass("fa-chevron-up")) {

        $("#like > i").removeClass('fa-chevron-up');
        $("#like > i").addClass('fa-chevron-down');
    }
    if ($("#dislike > i").hasClass("fa-chevron-up")) {

        $("#dislike > i").removeClass('fa-chevron-up');
        $("#dislike > i").addClass('fa-chevron-down');
    }
    if ($("#comment > i").hasClass("fa-chevron-up")) {

        $("#comment > i").removeClass('fa-chevron-up');
        $("#comment > i").addClass('fa-chevron-down');
    } else {

        $("#comment > i").removeClass('fa-chevron-down');
        $("#comment > i").addClass('fa-chevron-up');
    }
});


$('#likeReaction').on('click', () => {
    $('#likeReaction > img').addClass('bounce')
    setTimeout(() => {
        $('#likeReaction > img').removeClass('bounce');
    }, 1300)
})

$('#dislikeReaction').on('click', () => {
    $('#dislikeReaction > img').addClass('bounceSad')
    setTimeout(() => {
        $('#dislikeReaction > img').removeClass('bounceSad');
    }, 1300)
})

$('#commentReaction').on('click', () => {
    $('#commentReaction > img').addClass('bounceQuestion')
    setTimeout(() => {
        $('#commentReaction > img').removeClass('bounceQuestion');
    }, 1300)
})






window.addEventListener('beforeunload', function(e) {
    console.log('called', e)
    if (!confirmed) {
        e.preventDefault();
        e.returnValue = '';
        if (logged) {
            $('#logged').modal('show');
            return true;
        } else {
            $('#anonim').modal('show');
            return true;
        }
    } else {
        delete e['returnValue'];
    }

});