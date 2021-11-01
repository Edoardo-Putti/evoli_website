var confirmed = false;
var full = false;
var understanding = $("#clarity");
var understandingValue = $("#clarityValue");
var appreciation = $("#appreciation");
var appreciationValue = $("#appreciationValue");

$(() => {
    if (sessionStorage.getItem('slider')) {
        var slider = JSON.parse(sessionStorage.getItem("slider"));
        var reactions = JSON.parse(sessionStorage.getItem("reactions"));
        console.log(reactions, slider)
    }
})

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



//YOUTUBE IN


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

    $('#loading').hide();
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