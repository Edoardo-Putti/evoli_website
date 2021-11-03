window.onload = function() {
    retriveData();
    hamburger_cross();
    $('.scrollbar').css({
        height: window.innerHeight / 2.2
    })
}

var folders;
var foldersName = [];
var videos;
var actualFolder;
var editing = false;

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\./g, '');
}

function retriveData() {
    $.ajax({
        url: "http://localhost:8000/teacher/retriveData",
        type: 'post',
        success: function(data) {
            folders = data.folders;
            videos = data.videos;
            if (folders) {
                displayFolders(folders)
                folders.forEach(f => {
                    foldersName.push(f.name);
                })
            }
            if (videos) {
                displayVideos(videos);
            }
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);
        },
    });
}

function displayFolders(folders) {
    $('#folderList').children('li').remove();
    $('#folder').empty();
    $('#folderMov').empty();
    var list = $('#folderList');
    folders.forEach((folder, index) => {
        var code = 'a' + folder.fid;
        if (index == 0) {
            actualFolder = folder.name;
            $('#actual').text(actualFolder);
            var foldVideoForm = '<option selected id="f' + folder.fid + '">' + folder.name + '</option>';
            var moveVideoForm = '<option selected id="m' + folder.fid + '">' + folder.name + '</option>';
        } else {
            var foldVideoForm = '<option id="f' + folder.fid + '">' + folder.name + '</option>';
            var moveVideoForm = '<option id="m' + folder.fid + '">' + folder.name + '</option>';
        }
        var fold = '<li  onclick="changeCurrentPath(' + code + ')" id="' + code + '"><a href="#folder">' + folder.name + '</a></li>';
        list.append(fold);
        $('#folder').append(foldVideoForm)
        $('#folderMov').append(moveVideoForm)

    })
}

function displayVideos(videos) {
    var table = $('#videoTable > tbody').empty();
    videos.forEach(video => {
        var code = 'a' + video.vid;
        if (htmlEntities($.trim(video.folder.toLowerCase())) === htmlEntities($.trim(actualFolder.toLowerCase()))) {
            var newContent = '<tr id="' + code + '"> \
                              <td id="' + video.url + '"><a style="color: black" target="_blank" title="view on YouTube" href="https://youtu.be/' + video.url + '">' + video.title + '</a></td> \
                              <td><div style=" width: 60px; display: inline-block; ">' + video.video_code + '</div>  <button class="btn btn-circle" onclick="copyFunction(' + code + ')"><i class="fa fa-clipboard fa-lg" title="copy"\
                                          aria-hidden="true"></i></button></td>\
                              <td id="' + video.video_code + '" > <button class="btn btn-circle"><i class="fa fa-eye fa-lg" title="view"\
                                          aria-hidden="true"></i></button></td>\
                              <td class="noteTd hoverEffect" onclick="seeNote(' + code + ')" > <div class="noteTxt" >' + htmlEntities(video.comment) + '</div></td>\
                            </tr>';
            table.prepend(newContent);
        }
    })
    if (editing) {
        editNewTable();
    }
}

function changeCurrentPath(newPath) {
    actualFolder = $.trim($('#' + newPath.id + ' > a').html());
    $('#folder option:selected').attr("selected", null);
    $("#f" + newPath.id).attr("selected", "selected");
    $('.popover').remove();
    $('#actual').text(actualFolder);
    displayVideos(videos);
}

function uploadFolder() {
    var name = $('#folderName').val();
    if (foldersName.includes($.trim(name).toLocaleLowerCase()) || foldersName.includes($.trim(name))) {
        $('#newFoldError').empty();
        $('#newFoldError').text("you already have a folder with this name. Plaese choose anothe one");
    } else {
        foldersName.push($.trim(name));
        $.ajax({
            url: "http://localhost:8000/teacher/newFolder",
            type: 'post',
            data: {
                name: name
            },
            success: function(data) {
                folders.push(data);
                displayFolders(folders)
                changeCurrentPath($('#a' + data.fid)[0])
                $(".showfo").trigger('click');
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                $('#newFoldError').empty()
                $('#newFoldError').text(errorMessage);
            },
        })
    }
}

function getYoutubeIdByUrl(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length == 11) {
        return match[7];
    }
    return false;
};

function ISO2Second(Isotime) {
    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0,
        minutes = 0,
        seconds = 0,
        totalseconds;

    if (reptms.test(Isotime)) {
        var matches = reptms.exec(Isotime);
        if (matches[1]) hours = Number(matches[1]);
        if (matches[2]) minutes = Number(matches[2]);
        if (matches[3]) seconds = Number(matches[3]);
        totalseconds = hours * 3600 + minutes * 60 + seconds;
        return totalseconds

    }
}

async function uploadVideo() {
    var id = getYoutubeIdByUrl($('#link').val())
    var url = 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=AIzaSyDKlvdmXY3wAbBNT8M_dayllK8_JvneOMA&part=contentDetails';
    if (id) {
        $.ajax({
            url: url,
            type: 'get',
            success: function(response) {
                var Isotime = response["items"][0]["contentDetails"]["duration"];
                var duration = ISO2Second(Isotime)
                if (duration) {
                    $.ajax({
                        url: "http://localhost:8000/teacher/newVideo",
                        type: 'post',
                        data: {
                            title: $('#className').val(),
                            folder: $('#folder option:selected').val(),
                            comment: $('#note').val(),
                            id: id,
                            seconds: duration
                        },
                        success: function(data) {
                            videos.push(data);
                            changeCurrentPath($('#a' + $('#folder option:selected').attr('id').slice(1))[0])
                            displayVideos(videos)
                            $(".showup").trigger('click');
                            $('#link').val('')
                            $('#note').val('')
                            $('#className').val('')

                        },
                        error: function(data, status) {
                            var errorMessage = JSON.parse(data.responseText).msg;
                            $('#newVideoError').empty()
                            $('#newVideoError').text(errorMessage);
                        },
                    });
                } else {
                    $('#newVideoError').empty()
                    $('#newVideoError').text('There is no video matching this URL');
                }
            },
            error: function(data, status) {
                $('#newVideoError').empty()
                $('#newVideoError').text('There is no video matching this URL');
            },
        })
    } else {
        $('#newVideoError').empty()
        $('#newVideoError').text('There is no video matching this URL');
    }

}


function deleteVideo() {
    if ($("input:checkbox:checked").length != 0) {
        $('#cancel').modal('show')
        $('#editButtons .delete').popover('dispose')
        $('#editBottonsSmall .delete').popover('dispose')
    } else {
        if ($('#editButtons').is(':visible')) {
            $('#editButtons .delete').popover({
                placement: "top",
                content: 'Please select at least one video!'
            }).popover('show')
            setTimeout(function() {
                $('#editButtons .delete').popover('hide')
            }, 2000);
        } else {
            $('#editBottonsSmall .delete').popover({
                placement: "top",
                content: 'Please select at least one video!'
            }).popover('show')
            setTimeout(function() {
                $('#editBottonsSmall .delete').popover('hide')
            }, 2000);
        }
    }
}

function moveVideo() {
    if ($("input:checkbox:checked").length != 0) {
        $('#move').modal('show')
        $('#editButtons .move').popover('dispose')
        $('#editBottonsSmall .move').popover('dispose')
    } else {
        if ($('#editButtons').is(':visible')) {
            $('#editButtons .move').popover({
                placement: "top",
                content: 'Please select at least one video!'
            }).popover('show')
            setTimeout(function() {
                $('#editButtons .move').popover('hide')
            }, 2000);
        } else {
            $('#editBottonsSmall .move').popover({
                placement: "top",
                content: 'Please select at least one video!'
            }).popover('show')
            setTimeout(function() {
                $('#editBottonsSmall .move').popover('hide')
            }, 2000);
        }
    }
}

function deleteReaction() {
    if ($("input:checkbox:checked").length != 0) {
        $('#delReaction').modal('show')
        $('#delReact').popover('dispose')
        $('#smallDelReact').popover('dispose')
        if ($("input:checkbox:checked").length == 1) {
            $('#delReaction .modal-body').html('Are you sure you want to delete all the reactions associated to this video?<br>The process is irreversible!<br>If you confirm you want to delete the reactions, choose between: <br><ul><li>confirm (deletion) and keep the same code</li><li>confirm (deletion) and change code (to get a new one)</li></ul> Otherwise, just close.')
        } else {
            $('#delReaction .modal-body').html('Are you sure you want to delete all the reactions associated to these videos?<br>The process is irreversible! <br> If you confirm you want to delete the reactions, choose between:<br><ul><li>confirm (deletion) and keep the same code</li><li>confirm (deletion) and change code (to get a new one)</li></ul> Otherwise, just close.')
        }
    } else {
        if ($('#editButtons').is(':visible')) {
            $('#delReact').popover({
                placement: "top",
                content: 'Please select at least one video!'
            }).popover('show')
            setTimeout(function() {
                $('#delReact').popover('hide')
            }, 2000);
        } else {
            $('#smallDelReact').popover({
                placement: "top",
                content: 'Please select at least one video!'
            }).popover('show')
            setTimeout(function() {
                $('#smallDelReact').popover('hide')
            }, 2000);
        }
    }
}

$(".edit").click(
    function() {
        if (editing) {
            edit();

        } else {
            edit();
            if ($('.hamburger').hasClass("is-closed")) {
                hamburger_cross();

            }
        }
    });

function edit() {
    if (jQuery.isReady) {
        if (editing == false) {
            $('.noteTd').removeClass('hoverEffect');
            for (var i = 0; i < videos.length; i++) {
                $("#a" + videos[i].vid + " td:first-child").append('  <button class="btn btn-circle modify" data-toggle="modal" data-target="#modifyTitle" onclick="modifyTitle(' + videos[i].vid + ')"><i class="fa fa-pencil fa-lg" title="edit"\
                                    aria-hidden="true"></i></button>')
                $("#a" + videos[i].vid + " td:last-child").append('  <button class="btn btn-circle modify" data-toggle="modal" data-target="#modifyNote" onclick="modifyNote(' + videos[i].vid + ')"><i class="fa fa-pencil fa-lg" title="edit"\
                                    aria-hidden="true"></i></button>')
                $("#a" + videos[i].vid).append('<td class="editing" >\
                                        <input  type="checkbox" value="' + i + '">\
                                        </td>');

            }
            $('.noteTd div').css({ 'display': 'inline-flex' });
            $("thead tr").append('<th class="editing" ></th>')
            if ($(window).width() < 1025) {
                $('#editBottonsSmall').show()
            } else {
                $('#editButtons').show()
            }
            $('.sidebar-nav li a ').css({ 'padding-left': '5px', });
            for (var i = 0; i < folders.length; i++) {
                $('#a' + folders[i].fid).append('<a id="' + i + 'f" class="mod" data-toggle="modal" data-target="#cancelFolder"  href="#trash"></a><a id="' + i + 'rf" class="mod" data-toggle="modal" data-target="#renameFolder" onclick="renameFolder(' + i + ')" href="#pencil"></a>')
            }
            if ($(window).width() > 760) {
                $('.sidebar-nav li a ').css({ 'display': 'inline-block', 'max-width': '145px' });
            } else {
                $('.sidebar-nav li a ').css({ 'display': 'inline-block' });
            }

            $('.sidebar-nav li a:not(:first-child) ').css({ 'padding-left': '0px' });
            editing = true
        } else {
            if ($(window).width() < 1025) {
                $('#editBottonsSmall').hide()
            } else {
                $('#editButtons').hide()
            }
            $('.noteTd').addClass('hoverEffect');
            $('.noteTd div').css({ 'display': 'block' });
            $(".my-table th:last-child, .my-table td:last-child").remove();
            $(".modify").remove();
            $(".mod").remove();
            $('.sidebar-nav li a').css({ 'display': 'block', 'max-width': 'fit-content' });
            $('.sidebar-nav li a ').css({ 'padding-left': '30px', });
            editing = false
        }
    }
}


function copyFunction(id) {
    var text = $('#' + id + ' td:nth-child(3)').text().replace(/ /g, '');
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    $('#' + id + ' td:nth-child(3) button').popover({
        placement: "right",
        content: 'Code copied!'
    }).popover('show')
    setTimeout(function() {
        $('#' + id + ' td:nth-child(3) button').popover('hide')
    }, 2000);



}


var trigger = $('.hamburger'),

    isClosed = false;

trigger.click(function() {
    hamburger_cross();
});

function hamburger_cross() {

    if (isClosed == true) {
        $('#wrapper').toggleClass('toggled');
        $("#hamburger").removeClass("fa-folder-open")
        $("#hamburger").addClass("fa-folder")
        trigger.removeClass('is-open');
        trigger.addClass('is-closed');
        isClosed = false;
    } else {
        $('#wrapper').toggleClass('toggled');
        $("#hamburger").removeClass("fa-folder")
        $("#hamburger").addClass("fa-folder-open")
        trigger.removeClass('is-closed');
        trigger.addClass('is-open');
        isClosed = true;
    }
}

$(".upload").hide();
$(".showup").click(function() {

    if ($(".upload").is(":hidden")) {
        $(".upload").show();
        $('#folder option:selected').attr("selected", null);
        $("#f" + actualFolder.replace(/ /g, '')).attr("selected", "selected");
        $(".showup-2").removeClass('fa-chevron-up');
        $(".showup-2").addClass('fa-chevron-down');
    } else {
        $(".upload").hide();
        $(".showup-2").removeClass('fa-chevron-down');
        $(".showup-2").addClass('fa-chevron-up');
    }
});

$(".newfold").hide();
$(".showfo").click(function() {
    if ($(".newfold").is(":hidden")) {
        $(".newfold").show();
        $(".showfo-2").removeClass('fa-chevron-up');
        $(".showfo-2").addClass('fa-chevron-down');
    } else {
        $(".newfold").hide();
        $(".showfo-2").removeClass('fa-chevron-down');
        $(".showfo-2").addClass('fa-chevron-up');
    }
});

$(window).resize(() => {

    $('#folder').height($('#className').outerHeight() - 2);
    if ($(window).width() < 965) {
        $('.showup').empty().append('<i class="fa fa-video-camera"></i> New Video <i class="fa fa-chevron-up showup-2" aria-hidden="true"></i>');
        $('.showfo').empty().append('<i class="fa fa-folder"></i> New folder <i class="fa fa-chevron-up showfo-2" aria-hidden="true"></i>');
    } else {
        $('.showfo').empty().append('<i class="fa fa-folder"></i> New folder <i class="fa fa-chevron-up showfo-2" aria-hidden="true"></i>');
        $('.showup').empty().append('<i class="fa fa-video-camera"></i> New Video <i class="fa fa-chevron-up showup-2" aria-hidden="true"></i>');
    }
})


$(document).ready(() => {

    $('#folder').height($('#className').outerHeight() - 2);
    if ($(window).width() < 965) {
        $('.showup').empty().append('<i class="fa fa-video-camera"></i> New Video <i class="fa fa-chevron-up showup-2" aria-hidden="true"></i>');
        $('.showfo').empty().append('<i class="fa fa-folder"></i> New folder <i class="fa fa-chevron-up showfo-2" aria-hidden="true"></i>');
    } else {

        $('.showup').empty().append('<i class="fa fa-video-camera"></i> New Video <i class="fa fa-chevron-up showup-2" aria-hidden="true"></i>');
    }
})

$(window).resize(() => {
    if ($(window).width() < 1025) {
        if (editing) {
            $('#editButtons').hide()
            $('#editBottonsSmall').show()
        }
    } else {
        if (editing) {
            $('#editBottonsSmall').hide()
            $('#editButtons').show()
        }
    }
})