$(".signup-form").hide();
$(".signup").css("background", "none");
$(".signup").click(function() {
    $(".login-form").hide();
    $(".signup-form").show();
    $(".login").css("background", "none");
    $(".signup").css("color", "#243d70");
    $(".login").css("color", "#ffb40d");
    $(".signup").css("background", "#dde6ed");

});

$(".login").click(function() {
    $(".login").css("color", "#243d70");
    $(".signup").css("color", "#ffb40d");
    $(".login-form").show();
    $(".signup-form").hide();
    $(".signup").css("background", "none");
    $(".login").css("background", "#dde6ed");

});

$("#show_hide_password a").on('click', function(event) {
    event.preventDefault();
    if ($('#show_hide_password input').attr("type") == "text") {
        $('#show_hide_password input').attr('type', 'password');
        $('#show_hide_password i').addClass("fa-eye-slash");
        $('#show_hide_password i').removeClass("fa-eye");
    } else if ($('#show_hide_password input').attr("type") == "password") {
        $('#show_hide_password input').attr('type', 'text');
        $('#show_hide_password i').removeClass("fa-eye-slash");
        $('#show_hide_password i').addClass("fa-eye");
    }
});