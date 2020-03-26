# JSPass

A chrome extension to generate random passwords using PBKDF2 with a master password and the domain name. Like this, each site has a unique password but you only have to remember one.

[Get it from Chrome Web Store](https://chrome.google.com/webstore/detail/jspass/hbofdeafjgfikkakjdgmlfojabijcdan)

## How it works

### Preparation

Before you can start generating passwords, you need to at least define a random salt and the number of iterations to use for the PBKDF2 function. For this, you need to open the options page via right-click on the JSPass extension icon.

![Options](/resources/screenshot_options.png)

Those global options are only stored locally in your browser. So please make sure you have a backup of your settings to be able to restore them later. Every change to the salt and iterations will result in completely different site-passwords.

### Generate password

Navigate to the login or register form of your desired page and click on the JSPass extension icon to open the popup.

![Popup](/resources/screenshot_popup.png)

The master password is the only one you have to remember and can be the same for each site. The domain name is extracted from the current URL. Ff you wish to use the third-level-domain (eg. www.site.com instead of just site.com) you have to add the desired domain on the options page or change it each time you create a password.

You can further customize the password for the current domain name via "Site settings". Eg. choose the minimum number of numbers or special chars.

![Popup](/resources/screenshot_popup_settings.png)

Clicking on "Create" will generate a new unique password for the current website:

1. Create a key (domain name + master password)
2. Use the defined salt and iteration number to initialize the PBKDF2 (SHA-256) function
3. Get some random bytes via PBKDF2 (they will always be the same for the same key, salt and iteration number)
4. Use those bytes to create a site password with the desired length and strength (with or without numbers or special chars)
5. If "Autofill password" was selected, then the generated site password will automatically be inserted in every password field on the website
6. If not, just click on "Copy & Close" and the password will be copied to the clipboard

Each time you create a password, the current settings are stored and automatically synced to any Chrome browser that you are logged into. JSPass will show a different icon when there are stored settings for the current domain (single key vs. two keys).

## Features

- No external library needed, just plain JavaScript (via Web Crypto API)
- Secure with PBKDF2: Needs the domain name, a master password, a salt and an iteration number (the later 2 are configurabel via options)
- Autofill passwords or copy to clipboard
- Global options (only localy stored):
  - Salt and number of iterations to use
  - Password length
  - My domains (domains for which third-level-domain names are used)
  - Special Chars
- Settings per domain/website (synced accross devices):
  - Password length
  - Use numbers and minimum count of numbers the password should have
  - Use special chars and minimum count of them
  - Autofill password

## Thanks

Many thanks to proicons.com who allowed me to use the key icons from their VISTA Alarm Icons pack.
