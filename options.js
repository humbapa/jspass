$(function() {
    restore_options();
    $("#f1").submit(function(event) {
        event.preventDefault();
        save_options();
        return false;
    });
});

function save_options() {
    if (!window.localStorage) {
        $("#info").html("Sorry can't store settings if LocalStorage is not accessible...");
        $("#f1").hide();
        return false;
    }
    
    $("#salt").val($.trim($("#salt").val()));
    $("#passwordlength").val($.trim($("#passwordlength").val()));
    $("#iterations").val($.trim($("#iterations").val()));
    $("#mydomains").val($.trim($("#mydomains").val()));
    $("#specialchars").val($.trim($("#specialchars").val()));
    
    if ($("#salt").val() == "") {
        $("#status").html("Salt can't be empty");
        return false;
    }
    if ($("#passwordlength").val() == "" || !$.isNumeric($("#passwordlength").val()) || $("#passwordlength").val() < 8) {
        $("#status").html("Password length can't be empty, must be a number and bigger or equal 8");
        return false;
    }
    if ($("#iterations").val() == "" || !$.isNumeric($("#iterations").val()) || $("#iterations").val() <= 0) {
        $("#status").html("Iterations can't be empty and must be a number");
        return false;
    }
    if ($("#specialchars").val() == "") {
        $("#status").html("Special chars can't be empty");
        return false;
    }
    
    if (window.localStorage.firstrun == undefined) {
        window.localStorage.firstrun = true;
    }
    
    window.localStorage.salt = $("#salt").val();
    window.localStorage.passwordlength = $("#passwordlength").val();
    window.localStorage.iterations = $("#iterations").val();
    window.localStorage.mydomains = $("#mydomains").val();
    window.localStorage.specialchars = $("#specialchars").val();
    
    $("#status").html("Settings successfully saved");
    
    return true;
}

function restore_options() {
    if (!window.localStorage) {
        $("#info").html("Sorry can't store settings if LocalStorage is not accessible...");
        $("#f1").hide();
        return false;
    }
    
    if (window.localStorage.firstrun == undefined) {
        $("#info").html("Please test your settings bevore using the generated passwords for real sites. If you change them later, your generated passwords will also change!");
        newsalt = CryptoJS.lib.WordArray.random(512/8);
        $("#salt").val(newsalt);
        newiterations = Math.floor(Math.random() * (700 - 500 + 1)) + 500;
        $("#iterations").val(newiterations);
    } else {
        $("#salt").val(window.localStorage.salt);
        $("#passwordlength").val(window.localStorage.passwordlength);
        $("#iterations").val(window.localStorage.iterations);
        $("#mydomains").val(window.localStorage.mydomains);
        $("#specialchars").val(window.localStorage.specialchars);
    }
    
    return true;
}