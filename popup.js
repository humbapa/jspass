// Focus Hack
/*
if(location.search !== "?foo") {
    location.search = "?foo";
    throw new Error;
}
*/
$(function() {
    if (!window.localStorage
        || window.localStorage.salt == undefined
        || window.localStorage.passwordlength == undefined
        || window.localStorage.iterations == undefined
        || window.localStorage.mydomains == undefined
        || window.localStorage.specialchars == undefined) {
        
        chrome.tabs.create({ url: "options.html" }); 
        window.close();
    }
    salt = window.localStorage.salt;
    passwordlength = window.localStorage.passwordlength;
    iterations = window.localStorage.iterations;
    mydomains = [];
    mydomainstext = window.localStorage.mydomains;
    if (mydomainstext != "") {
        mydomainstextpieces = mydomainstext.split(",");
        for (i=0; i < mydomainstextpieces.length; i++) {
            mydomains[i] = $.trim(mydomainstextpieces[i]);
        }
    }
    
    chrome.tabs.getSelected(null, function(tab) {
        currenturl = tab.url.toLowerCase();
        currenthostname = currenturl.match(/\/([^\/:]+)/)[1];
        currenthostnamepieces = currenthostname.split(".");
        currentdomainname = currenthostnamepieces[currenthostnamepieces.length - 2]
            + "."
            + currenthostnamepieces[currenthostnamepieces.length - 1];
        
        if (mydomains.length > 0
            && currenthostnamepieces.length > 2
            && $.inArray(currentdomainname, mydomains) != -1) {
            
            currentdomainname = currenthostnamepieces[currenthostnamepieces.length - 3]
                + "."
                + currentdomainname;
        }
        
        $("#domainname").val(currentdomainname);
        $("#masterpassword").focus();
        
        chrome.storage.sync.get(currentdomainname, function(items) {
            if (items[$("#domainname").val()]) {
                oldsitesettingsobj = JSON.parse(items[$("#domainname").val()]);
                if (oldsitesettingsobj.specialchars != undefined) {
                    $("#specialchars").attr("checked", oldsitesettingsobj.specialchars);
                }
                if (oldsitesettingsobj.autofill != undefined) {
                    $("#autofill").attr("checked", oldsitesettingsobj.autofill);
                }
            }
        });
        
        $("#f1 input").each(function() {
            $(this).keydown(function(event) {
                event.stopPropagation();
                if (event.which == 13) {
                    $("#f1").submit();
                }
            });            
        });
        
        $("#f1").submit(function(event) {
            event.preventDefault();
            $("#domainname").val($.trim($("#domainname").val()));
            sitepassword = createpassword($("#masterpassword").val(), 
                $("#domainname").val(),
                salt,
                passwordlength,
                iterations,
                $("#specialchars").attr("checked"),
                window.localStorage.specialchars);
            if (sitepassword != "") {
                // Store settings
                newsettingsobj = {
                    specialchars: $("#specialchars").attr("checked") ? true : false,
                    autofill: $("#autofill").attr("checked") ? true : false
                };
                domainnamevalue = $("#domainname").val();
                storagevalues = {};
                storagevalues[$("#domainname").val()] = JSON.stringify(newsettingsobj);
                chrome.storage.sync.set(storagevalues, function() {
                    if ($("#autofill").attr("checked")) {
                        autofillok = true;
                        chrome.tabs.executeScript(null, { file: "content.js" });
                        chrome.tabs.getSelected(null, function(tab) {
                            chrome.tabs.sendRequest(tab.id, { password: sitepassword }, function(response) {
                                if (response.autofill) {
                                    window.close();
                                } else {
                                    noautofill();
                                }
                            });
                        });
                    } else {
                        noautofill();
                    }
                });
            } else {
                window.close();
            }
            return false;
        });
    });
});

function noautofill() {
    $("#f1 > p").each(function() {
        $(this).hide();
    });
    $("#f1 > p:first input").val(sitepassword);
    $("#f1 > p:first").show();
    $("#f1 > p:first input").focus();
    $("#f1 > p:first input").select();
    $("#f1 > p:last input").val("Copy & Close");
    $("#f1 > p:last input").click(function (event) {
        event.preventDefault();
        $("#f1 > p:first input").select();
        jqueryevent = $.Event("keydown");
        jqueryevent.which = 13;
        $("#f1 > p:first input").trigger(jqueryevent);
        return false;
    });
    $("#f1 > p:last").show();
    $("#f1").unbind();
    $("#f1").submit(function(event) {
        event.preventDefault();
        document.execCommand("copy", false, $("#f1 > p:first input").val());
        window.close();
        return false;
    });
}

function createpassword(masterpassword, domainname, salt, passwordlength, iterations, usespecialchars, specialchars) {
    passwordobj = CryptoJS.PBKDF2(masterpassword + domainname, salt, {
        keySize: passwordlength,
        iterations: iterations });
    passwordwordsarray = passwordobj.words;
    
    chars1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    chars2 = "abcdefghijklmnopqrstuvwxyz";
    chars3 = "0123456789";
    chars4 = specialchars;
    chars = chars1 + chars2 + chars3;
    if (usespecialchars) {
        chars += chars4;
    }
    chars1count = 0;
    chars2count = 0;
    chars3count = 0;
    chars4count = 0;
    
    password = "";
    charscheckindex = Math.floor(passwordlength / 3);
    
    for (i=0; i < passwordlength; i++) {
        charstemp = chars;
        if (i >= charscheckindex) {
            if (usespecialchars && chars4count <= 2) {
                charstemp = chars4;
            } else if (chars1count <= 1) {
                charstemp = chars1;
            } else if (chars2count <= 1) {
                charstemp = chars2;
            } else if (chars3count <= 1) {
                charstemp = chars3;
            }
        }
        do {
            charsindextemp = Math.abs(passwordwordsarray[i]) % charstemp.length;
            if (passwordwordsarray[i] < 0) {
                charsindextemp = charstemp.length - 1 - charsindextemp;
            }
            passwordwordsarray[i] += passwordwordsarray[i] + 1;
            passwordchar = charstemp[charsindextemp];
        } while (password.indexOf(passwordchar) > -1);
        
        if (chars1.indexOf(passwordchar) >- 1) {
            chars1count++;
        } else if(chars2.indexOf(passwordchar) >- 1){
            chars2count++;
        } else if(chars3.indexOf(passwordchar) >- 1){
            chars3count++;
        } else if(usespecialchars && chars4.indexOf(passwordchar) >- 1){
            chars4count++;
        }
        
        password += passwordchar;
    }
    
    return password;
}