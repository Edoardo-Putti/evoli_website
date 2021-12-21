window.onload = function() {
    retriveData();
    hamburger_cross();
    $('.scrollbar').css({
        height: window.innerHeight / 2.2
    })
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover', placement: 'auto' })
}

var folders;
var name2id = {};
var folders2code = {};
var videos;
var actualFolder;
var editing = false;

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\./g, '');
}

function retriveData() {
    $.ajax({
        url: "teacher/retriveData",
        type: 'post',
        success: function(data) {
            folders = data.folders;
            videos = data.videos;
            if (folders) {

                folders.forEach((f, i) => {
                    name2id[f.name] = 'a' + i;
                })
                displayFolders(folders)
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
        var code = name2id[folder.name];
        if (index == 0) {
            actualFolder = folder.name;
            $('#actual').text(actualFolder);
            var foldVideoForm = '<option selected id="f' + code + '">' + folder.name + '</option>';
            var moveVideoForm = '<option selected id="m' + code + '">' + folder.name + '</option>';
        } else {
            var foldVideoForm = '<option id="f' + code + '">' + folder.name + '</option>';
            var moveVideoForm = '<option id="m' + code + '">' + folder.name + '</option>';
        }
        var fold = '<li  onclick="changeCurrentPath(' + code + ')" id="' + code + '"><a href="#folder">' + folder.name + '</a></li>';
        list.append(fold);
        $('#folder').append(foldVideoForm)
        $('#folderMov').append(moveVideoForm)
        if (editing) {

            $('#' + code).append('<a name="' + index + '" class="mod" data-toggle="modal" data-target="#cancelFolder" onclick="deleteFolder(this)"  href="#trash"></a><a name="' + index + '" class="mod" data-toggle="modal" data-target="#renameFolder" onclick="renameFolder(this)" href="#pencil"></a>')

        }
    })
    if (editing) {
        $('.sidebar-nav li a ').css({ 'padding-left': '5px', });
        if ($(window).width() > 760) {
            $('.sidebar-nav li a ').css({ 'display': 'inline-block', 'max-width': '145px' });
        } else {
            $('.sidebar-nav li a ').css({ 'display': 'inline-block' });
        }
        $('.sidebar-nav li a:not(:first-child) ').css({ 'padding-left': '0px' });

    }
}

function displayVideos(videos) {
    var table = $('#videoTable > tbody').empty();
    var tableSearch = $('#videoTableSearch > tbody').empty();
    folders2code = {}
    videos.forEach((video, i) => {
        var code = 'v' + i;
        if (htmlEntities($.trim(video.folder.toLowerCase())) === htmlEntities($.trim(actualFolder.toLowerCase()))) {

            var newContent = '<tr id="' + code + '"> \
                              <td id="' + video.url + '"><a style="color: black" target="_blank" title="view on YouTube" href="https://youtu.be/' + video.url + '">' + video.title + '</a></td> \
                              <td id="s' + code + '"> <button class="btn btn-circle" onclick="showStat(this)"><i class="fa fa-eye fa-lg" title="view"\
                              aria-hidden="true"></i></button></td>\
                              <td ><div style=" width: 60px; display: inline-block; ">' + video.video_code + '</div>  <button class="btn btn-circle" name="' + video.video_code + '" onclick="copyFunction(this)"><i class="fa fa-clipboard fa-lg" title="copy"\
                                          aria-hidden="true"></i></button></td>\
                              <td name="' + i + '" class="noteTd hoverEffect" onclick="seeNote(this)"> <div class="noteTxt" >' + htmlEntities(video.comment) + '</div></td>\
                            </tr>';
            table.prepend(newContent);
            if (video.new != 0) {
                $('#s' + code + ' button').css({ 'margin-left': '16.5px' })
                $('#s' + code).append('<span class="badge">' + video.new + '</span>')
            }
            if (editing) {
                $("#" + code + " td:first-child").append('<button class="btn btn-circle modify" name="' + i + '" data-toggle="modal" data-target="#modifyTitle" onclick="modifyTitle(this)"><i class="fa fa-pencil fa-lg" title="edit"\
                                aria-hidden="true"></i></button>')
                $("#" + code + " td:last-child").append('  <button class="btn btn-circle modify" data-toggle="modal" data-target="#modifyNote"><i class="fa fa-pencil fa-lg" title="edit"\
                                aria-hidden="true"></i></button>')
                $("#" + code).append('<td class="editing">\
                                            <input type="checkbox" value="' + i + '" >\
                                            </td>');
            }
        }


        try { folders2code[video.folder].push(video.video_code) } catch {
            folders2code[video.folder] = []
            folders2code[video.folder].push(video.video_code)
        }
        var code = 't' + i;
        var newContent = '<tr id="' + code + '"> \
                    <td><a style="color: black" target="_blank" title="view on YouTube" href="https://youtu.be/' + video.url + '">' + video.title + '</a></td> \
                    <td id="k' + code + '" > <button class="btn btn-circle" onclick="showStat(this)"><i class="fa fa-eye fa-lg" title="view"\
                                aria-hidden="true"></i></button></td>\
                    <td><div style=" width: 60px; display: inline-block; ">' + video.video_code + '</div>  <button class="btn btn-circle" name="' + video.video_code + '" onclick="copyFunction(this)"><i class="fa fa-clipboard fa-lg" title="copy"\
                                aria-hidden="true"></i></button></td>\
                    <td class="noteTd hoverEffect" onclick="seeNote(k' + video.video_code + ')" > <div class="noteTxt" >' + htmlEntities(video.comment) + '</div></td>\
                    <td class=" hoverEffect" onclick="changeCurrentPath(' + name2id[video.folder] + ')" ><div class="noteTxt" > ' + video.folder + '</div></td>\
                  </tr>';
        tableSearch.prepend(newContent);
        if (video.new != 0) {
            $('#k' + code + ' button').css({ 'margin-left': '16.5px' })
            $('#k' + code).append('<span class="badge">' + video.new + '</span>')
        }


    })

}

function changeCurrentPath(newPath) {
    actualFolder = $.trim($('#' + newPath.id + ' > a').html());
    $('#folder option:selected').attr("selected", null);
    $("#f" + newPath.id).attr("selected", "selected");
    $('.popover').remove();
    $('#actual').text(actualFolder);
    if (searching) {
        $("#videoTableSearch").hide()
        $("#videoTable").show()
        searching = false
    }
    displayVideos(videos);
}

function deleteFolder(tr) {
    $('#confirmDelFolder').attr('value', $(tr).parent().text())
}

function confirmDeleteFolder() {
    var folder = $('#confirmDelFolder').attr('value');
    var codes = (folders2code[folder]) ? folders2code[folder] : [];
    $.ajax({
        url: './teacher/deleteFolder',
        type: 'post',
        data: {
            folder: folder,
            codes: JSON.stringify(codes),
        },
        success: function(data) {
            videos.forEach((video, i) => {
                if (video.folder == folder)
                    videos.splice(i, 1);
            })
            folders.splice(name2id[folder].slice(1), 1);
            delete folders2code[folder]

            if (Number(name2id[folder].slice(1)) != 0) {
                changeCurrentPath(a0)
            } else {
                changeCurrentPath(a1)
            }
            delete name2id[folder];
            $('#cancelFolder').modal('hide')
            displayFolders(folders);

        },
        error: function(data, status) {
            console.log(data)
            var errorMessage = JSON.parse(data.responseText).msg;
            $('#folderError').val(errorMessage)
        },
    })
}

function renameFolder(tr) {
    $('#modFoldTitle').val($(tr).parent().text());
    $('#confirmRename').attr('value', $(tr).attr('name'))
}

function confirmRenameFolder() {
    var newFolderName = $('#modFoldTitle').val();
    var key = $('#confirmRename').attr('value');
    var old = folders[key].name;
    var isNew = true
    folders.forEach(folder => {
        if (folder.name == $.trim(newFolderName).toLocaleLowerCase() || folder.name == $.trim(newFolderName))
            isNew = false
    })
    if (!isNew) {
        $('#folderError').text("you already have a folder with this name. Plaese choose anothe one");
    } else {
        $.ajax({
            url: 'teacher/renameFolder',
            type: 'post',
            data: {
                name: newFolderName,
                old: old,
            },
            success: function(data) {
                folders[key].name = newFolderName
                videos.forEach(video => {
                    if (video.folder == old)
                        video.folder = newFolderName;
                })
                delete name2id[old]
                name2id[newFolderName] = 'a' + key
                $('#renameFolder').modal('hide')
                changeCurrentPath($('#' + name2id[newFolderName])[0])
                displayFolders(folders)
                displayVideos(videos);
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                $('#folderError').val(errorMessage)
            },
        })

    }

}


function modifyTitle(tr) {
    $('#modTitle').val($(tr).parent().text());
    $('#confirmModTitle').attr('value', $(tr).attr('name'))
}

function confirmModifyTitle() {
    var newTitle = $('#modTitle').val();
    var key = $('#confirmModTitle').attr('value');
    if (newTitle.length == 0) {
        $('#titleError').empty().append('the title canno\'t be empty!')
    } else {
        $.ajax({
            url: 'teacher/modifyTitle',
            type: 'post',
            data: {
                title: newTitle,
                code: videos[key].video_code
            },
            success: function(data) {
                videos[key].title = newTitle
                $('#modifyTitle').modal('hide')
                displayVideos(videos);
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                $('#textNote').val(errorMessage)
            },
        })

    }
}

function seeNote(tr) {
    if (!editing) {
        $('#SeeNote').modal('show');
        $('#textNote').val(tr.innerText);
    } else {
        $('#modNote').val(tr.innerText);
    }
    $('#confirmModNote').attr('value', $(tr).attr('name'))
}

function editNote() {
    if (editing) {
        var newNote = $('#modNote').val();
    } else {
        var newNote = $('#textNote').val();
    }
    var key = $('#confirmModNote').attr('value');
    $.ajax({
        url: 'teacher/modifyComment',
        type: 'post',
        data: {
            note: newNote,
            code: videos[key].video_code
        },
        success: function(data) {
            videos[key].comment = newNote
            $('#SeeNote').modal('hide');
            $('#modifyNote').modal('hide')
            displayVideos(videos);
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            $('#textNote').val(errorMessage)
        },
    })

}

function uploadFolder() {
    var name = $('#folderName').val();
    var isNew = true;
    folders.forEach(folder => {
        if (folder.name == $.trim(name).toLocaleLowerCase() || folder.name == $.trim(name))
            isNew = false
    })
    if (!isNew) {
        $('#newFoldError').empty();
        $('#newFoldError').text("you already have a folder with this name. Plaese choose anothe one");
    } else {
        $.ajax({
            url: "teacher/newFolder",
            type: 'post',
            data: {
                name: name
            },
            success: function(data) {
                name2id[data.name] = 'a' + folders.length
                folders.push(data);
                folders2code[name] = []
                displayFolders(folders)
                changeCurrentPath($('#' + name2id[data.name])[0])
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
                        url: "teacher/newVideo",
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
                            if ($('#folder option:selected').val() != actualFolder)
                                changeCurrentPath($('#' + name2id[$('#folder option:selected').val()])[0])
                            else
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

function confirmDeleteVideo() {
    var codes = []
    $("input:checkbox:checked").each(function() {
        codes.push($(this).parent().prev().prev()[0].innerText.replace(/ /g, ''))
    })
    $.ajax({
        url: 'teacher/deleteVideo',
        type: 'post',
        data: {
            codes: JSON.stringify(codes)
        },
        success: function(data) {
            videos.forEach((video, index) => {
                var y = codes.indexOf(video.video_code)
                if (y != -1)
                    videos.splice(index, 1);
            })
            displayVideos(videos)
            $('#cancel').modal('hide');
        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);

        },
    })
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

function aggStats() {
    var tableStats = $('#tableStats > tbody').empty();

    videos.forEach((video, i) => {
        $.ajax({
            url: 'teacher/checkOne',
            type: 'post',
            data: {
                code: video.video_code
            },
            success: function(data) {
                if (data) {
                    var code = 'a' + video.video_code
                    var newContent = '<tr id="' + code + '"> \
                    <td colspan=1><a style="color: black" target="_blank" title="view on YouTube" href="https://youtu.be/' + video.url + '">' + video.title + '</a></td> \
                    <td colspan=2 class=" hoverEffect" onclick="selectAll(this)" name="' + video.folder + '" data-toggle="tooltip"  title="Click to select/deselect all the video in this folder" ><div class="noteTxt" > ' + video.folder + '</div></td>\
                    <td colspan=1 class="editing" ><input class="check"  type="checkbox" value="' + i + '"></td>\
                  </tr>';
                    tableStats.prepend(newContent);
                } else {
                    var code = 'a' + video.video_code
                    var newContent = '<tr id="' + code + '"> \
                    <td colspan=1><a style="color: black" target="_blank" title="view on YouTube" href="https://youtu.be/' + video.url + '">' + video.title + '</a></td> \
                    <td colspan=2 class=" hoverEffect" onclick="selectAll(this)" name="' + video.folder + '" data-toggle="tooltip"  title="Click to select/deselect all the video in this folder" ><div class="noteTxt" > ' + video.folder + '</div></td>\
                    <td colspan=1 class="editing" data-toggle="tooltip"  title="This video has no feedback yet"><input class="check"  type="checkbox" value="' + i + '" disabled></td>\
                  </tr>';
                    tableStats.prepend(newContent);
                }
                $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover', placement: 'auto' })
            },
            error: function(data, status) {
                var errorMessage = JSON.parse(data.responseText).msg;
                console.log(errorMessage);

            },
        })

    })
    $('#aggStats').modal('show')
        // $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover', placement: 'auto' })
}


function compare() {
    var tableStats = $('#tableStats > tbody tr')
    if ($('#tableStats > thead th').length < 4) {
        $('#tableStats > thead tr th').last().append('G.1')
        $('#tableStats > thead tr').append('<th class="editing" >G.2</th>')

        tableStats.append('<td class="editing second" ><input  type="checkbox" ></td>');
    } else {
        $('#tableStats > thead tr').children().last().remove()
        $('#tableStats > tbody .second').remove()
    }

}

$('#aggStats').on('hidden.bs.modal', function(event) {
    $('#ConfirmStats').attr('value', 'b2');
    $('#b2').addClass("selected")
    $('#b1').removeClass("selected")
    $('#b3').removeClass("selected")
    if ($('#tableStats > thead th').length >= 4) {
        $('#tableStats > thead tr').children().last().remove()
        $('#tableStats > thead tr').children().last().empty()
        $('#tableStats > tbody .second').remove()
    }
})

$('#b1').on('click', () => {
    $('#ConfirmStats').attr('value', 'b1');
    $('#b1').addClass("selected")
    $('#b2').removeClass("selected")
    $('#b3').removeClass("selected")
})

$('#b2').on('click', () => {
    $('#ConfirmStats').attr('value', 'b2');
    $('#b2').addClass("selected")
    $('#b1').removeClass("selected")
    $('#b3').removeClass("selected")
})

$('#b3').on('click', () => {
    $('#ConfirmStats').attr('value', 'b3');
    $('#b3').addClass("selected")
    $('#b2').removeClass("selected")
    $('#b1').removeClass("selected")
})

function delCol() {
    var tableStats = $('#tableStats > tbody tr')
    if ($('#tableStats > thead th').length >= 4) {
        $('#tableStats > thead tr').children().last().remove()
        $('#tableStats > thead tr').children().last().empty()
        $('#tableStats > tbody .second').remove()
    }

}

var elem = '<div class="row justify-content-center "><div class="col-12 d-flex justify-content-center"><p class="btn btn-logOut pop" >Group 1</p><p class="btn btn-logOut pop" > Group 2</p></div></div>'
var elements = []

function selectAll(folder) {
    if ($('#ConfirmStats').attr('value') == 'b1') {

        $("#tableStats tbody:nth-child(2) tr").filter(function() {
            if ($(this).children('.hoverEffect').text().toLowerCase().indexOf($(folder).attr("name")) > -1) {
                if ($(this).children('.hoverEffect').text().replace(/\s+/g, ' ').trim() === $(folder).attr("name").replace(/\s+/g, ' ').trim() && !$(this).children(".editing").children().attr('disabled')) {
                    elements.push($(this))
                }
            }
        });
        $('#whichGroup').modal('show');
    } else {
        $("#tableStats tbody:nth-child(2) tr").filter(function() {
            if ($(this).children('.hoverEffect').text().toLowerCase().indexOf($(folder).attr("name")) > -1) {
                if ($(this).children('.hoverEffect').text().replace(/\s+/g, ' ').trim() === $(folder).attr("name").replace(/\s+/g, ' ').trim() && !$(this).children(".editing").children().attr('disabled')) {
                    if ($(this).children(".editing").children().prop("checked")) {
                        $(this).children(".editing").children().prop("checked", false)
                    } else {
                        $(this).children(".editing").children().prop("checked", true)
                    }
                }


            }
        });
    }
}

function group(val) {
    if ($(val).attr('name') == 1) {
        elements.forEach((elem) => {
            if ($(elem).children(".editing").children().first().prop("checked")) {
                $(elem).children(".editing").children().first().prop("checked", false)
            } else {
                $(elem).children(".editing").children().first().prop("checked", true)
            }

        })
    } else {
        elements.forEach((elem) => {
            if ($(elem).children(".editing").children().last().prop("checked")) {
                $(elem).children(".editing").children().last().prop("checked", false)
            } else {
                $(elem).children(".editing").children().last().prop("checked", true)
            }

        })
    }
    $('#whichGroup').modal('hide');
    elements = []
}

function confirmAggStast() {
    if ($("#tableStats input:checkbox:checked").length != 0) {
        if ($('#ConfirmStats').attr('value') == 'b1') {
            var group1 = []
            var group2 = []
            $("#tableStats input:checkbox:checked").each(function() {
                if ($(this).val() != 'on') {
                    group1.push($(this).parent().parent().attr("id").substring(1))
                } else {
                    group2.push($(this).parent().parent().attr("id").substring(1))
                }

            })
            localStorage.setItem('group1', JSON.stringify(group1))
            localStorage.setItem('group2', JSON.stringify(group2))
            window.location.href = 'teacher/compare'

        } else if ($('#ConfirmStats').attr('value') == 'b2') {
            var codes = []
            $("#tableStats input:checkbox:checked").each(function() {
                codes.push($(this).parent().parent().attr("id").substring(1))
            })
            localStorage.setItem('codes', JSON.stringify(codes))
            window.location.href = 'teacher/aggStats'
        } else {
            var codes = []
            $("#tableStats input:checkbox:checked").each(function() {
                codes.push($(this).parent().parent().attr("id").substring(1))
            })
            localStorage.setItem('codes', JSON.stringify(codes))
            window.location.href = 'teacher/studentStats'
        }
    } else {
        $('#ConfirmStats').popover({
            placement: "top",
            content: 'Please select at least one video!'
        }).popover('show')
        setTimeout(function() {
            $('#ConfirmStats').popover('hide')
        }, 2000);
    }
}



function confirmMoveVideo() {
    var codes = []
    $("input:checkbox:checked").each(function() {
        codes.push($(this).parent().prev().prev()[0].innerText.replace(/ /g, ''))
    })
    var newFolder = $('#folderMov option:selected').val();
    $.ajax({
        url: 'teacher/moveVideo',
        type: 'post',
        data: {
            folder: newFolder,
            codes: JSON.stringify(codes)
        },
        success: function(data) {
            videos.forEach((video, index) => {
                if (codes.indexOf(video.video_code) != -1) {
                    videos[index].folder = newFolder;
                }
            })
            displayVideos(videos)
            $('#move').modal('hide');

        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);

        },
    })
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

function confirmDeleteReaction() {
    var codes = []
    $("input:checkbox:checked").each(function() {
        codes.push($(this).parent().prev().prev()[0].innerText.replace(/ /g, ''))
    })
    $.ajax({
        url: 'teacher/removeFeedback',
        type: 'post',
        data: {
            codes: JSON.stringify(codes)
        },
        success: function(data) {
            videos.forEach((video, index) => {
                if (codes.indexOf(video.video_code) != -1) {
                    videos[index].new = 0;
                }
            })
            $("input:checkbox:checked").each(function() {
                $(this).prop('checked', false);
            })
            displayVideos(videos)
            $('#delReaction').modal('hide');

        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);

        },
    })
}

function confirmDelReactCodeChange() {
    var codes = []
    $("input:checkbox:checked").each(function() {
        codes.push($(this).parent().prev().prev()[0].innerText.replace(/ /g, ''))
    })
    $.ajax({
        url: 'teacher/removeFeedbackCode',
        type: 'post',
        data: {
            codes: JSON.stringify(codes)
        },
        success: function(data) {
            videos.forEach((video, index) => {
                if (codes.indexOf(video.video_code) != -1) {
                    videos[index].new = 0;
                    videos[index].video_code = data.videos[video.video_code];
                }
            })
            $("input:checkbox:checked").each(function() {
                $(this).prop('checked', false);
            })
            displayVideos(videos)
            $('#delReaction').modal('hide');

        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);

        },
    })
}

function showStat(tr) {
    var code = $(tr).parent().next().text()
    $.ajax({
        url: 'teacher/showStats',
        type: 'post',
        data: {
            code: code
        },
        success: function(data) {
            if (data) {
                document.location.href = 'teacher/statistics';
            } else {
                $(tr).popover({
                    placement: "right",
                    content: 'unfortunately this video has no feedback yet!'
                }).popover('show')
                setTimeout(function() {
                    $(tr).popover('hide')
                }, 2000);
            }

        },
        error: function(data, status) {
            var errorMessage = JSON.parse(data.responseText).msg;
            console.log(errorMessage);

        },
    })
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
            $('#videoTable .noteTd').removeClass('hoverEffect');
            for (var i = 0; i < videos.length; i++) {
                $("#v" + i + " td:first-child").append('  <button class="btn btn-circle modify" name="' + i + '" data-toggle="modal" data-target="#modifyTitle" onclick="modifyTitle(this)"><i class="fa fa-pencil fa-lg" title="edit"\
                                    aria-hidden="true"></i></button>')
                $("#v" + i + " td:last-child").append('  <button class="btn btn-circle modify" data-toggle="modal" data-target="#modifyNote"><i class="fa fa-pencil fa-lg" title="edit"\
                aria-hidden="true"></i></button>')
                $("#v" + i).append('<td class="editing" >\
                                        <input  type="checkbox" value="' + i + '">\
                                        </td>');

            }
            $('#videoTable .noteTd div').css({ 'display': 'inline-flex' });
            $("#videoTable thead tr").append('<th class="editing" ></th>')
            if ($(window).width() < 1025) {
                $('#editBottonsSmall').show()
            } else {
                $('#editButtons').show()
            }
            $('.sidebar-nav li a ').css({ 'padding-left': '5px', });
            for (var i = 0; i < folders.length; i++) {
                $('#a' + i).append('<a name="' + i + '" class="mod" data-toggle="modal" data-target="#cancelFolder" onclick="deleteFolder(this)"  href="#trash"></a><a name="' + i + '" class="mod" data-toggle="modal" data-target="#renameFolder" onclick="renameFolder(this)" href="#pencil"></a>')
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
            $('#videoTable .noteTd').addClass('hoverEffect');
            $('#videoTable .noteTd div').css({ 'display': 'block' });
            $("#videoTable th:last-child").remove();
            $("#videoTable td:last-child").remove();
            $(".modify").remove();
            $(".mod").remove();
            $('.sidebar-nav li a').css({ 'display': 'block', 'max-width': 'fit-content' });
            $('.sidebar-nav li a ').css({ 'padding-left': '30px', });
            editing = false
        }
    }
}




$("#searchstats").on("keyup", function(e) {
    var value = $(this).val().toLowerCase();
    $("#tableStats tbody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
    if (e.key == 'Enter') {
        $("#searchstats").val('');
        var value = "";
        $("#tableStats tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
        return false;
    }
});

$('#searchstats').on("search", function(e) {
    var value = $(this).val().toLowerCase();
    $("#tableStats tbody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
    return false;

});

var searching = false

$("#search").on("keyup", function(e) {
    if (!searching) {
        $('#actual').text('Global search');
        $("#videoTableSearch").show()
        $("#videoTable").hide()
        $('#videoTable > tbody').empty();
    }
    searching = true
    var value = $(this).val().toLowerCase();
    $("#videoTableSearch tbody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
    if (e.key == 'Enter') {
        $('#actual').text(actualFolder);
        $("#videoTableSearch").hide()
        $("#videoTable").show()
        displayVideos(videos)
        searching = false
        return false;
    }
});

$('#search').on("search", function(e) {
    $('#actual').text(actualFolder);
    $("#videoTableSearch").hide()
    $("#videoTable").show()
    displayVideos(videos)
    searching = false
    return false;

});

function copyFunction(id) {
    var text = id.name
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    $(id).popover({
        placement: "right",
        content: 'Code copied! Now share it with the students'
    }).popover('show')
    setTimeout(function() {
        $(id).popover('hide')
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
        $("#f" + name2id[actualFolder]).attr("selected", "selected");
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