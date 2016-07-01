function jspass_autofill(password) {
    autofillok = false;
    for(fi=0; fi < document.forms.length; fi++) {
        if (document.forms[fi].elements) {
            for(ei=0; ei < document.forms[fi].elements.length; ei++) {
                if(document.forms[fi].elements[ei].type && document.forms[fi].elements[ei].type == "password") {
                    document.forms[fi].elements[ei].value = password;
                    autofillok = true;
                }
            }
        }
    }
    return { autofill: autofillok };
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.password != "") {
            sendResponse(jspass_autofill(request.password));
        }
});