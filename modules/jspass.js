const VERSION = 2.0

const OPTIONS_FIELDS = {
  VERSION: 'version',
  ITERATIONS: 'iterations',
  SALT: 'salt',
  SPECIALCHARS: 'specialchars',
  MYDOMAINS: 'mydomains',
  PASSWORDLENGTH: 'passwordlength',
}

function getVersion() {
  const version = window.localStorage.getItem(OPTIONS_FIELDS.VERSION)
  if (!version) {
    return 0
  }
  return version
}

function getDomainnameFromURL(url) {
  if (!url) {
    return ''
  }

  const hostname = url.toLowerCase().match(/\/([^\/:]+)/)[1]
  const hostnamepieces = hostname.split('.')
  const hostnamepieceslength = hostnamepieces.length

  let domainname = ''
  if (hostnamepieceslength > 1) {
    domainname = `${hostnamepieces[hostnamepieceslength - 2]}.${hostnamepieces[hostnamepieceslength - 1]}`
    if (hostnamepieceslength > 2) {
      const mydomains = window.localStorage.getItem(OPTIONS_FIELDS.MYDOMAINS)
      if (mydomains) {
        const mydomainspieces = mydomains.split(',')
        for (let i = 0, ii = mydomainspieces.length; i < ii; i++) {
          if (mydomainspieces[i].trim() === domainname) {
            domainname = `${hostnamepieces[hostnamepieceslength - 3]}.${domainname}`
            break
          }
        }
      }
    }
  } else if (hostnamepieceslength == 1) {
    domainname = hostnamepieces[0]
  }

  return domainname
}

function setExtensionIcon(domainname) {
  if (domainname !== '') {
    chrome.storage.sync.get([domainname], item => {
      if (item[domainname]) {
        chrome.browserAction.setIcon({ path: 'resources/icon_active19.png' })
      } else {
        chrome.browserAction.setIcon({ path: 'resources/icon19.png' })
      }
    })
  } else {
    chrome.browserAction.setIcon({ path: 'resources/icon19.png' })
  }
}

function getAllOptions() {
  const storageData = {}
  for (const constFieldName in OPTIONS_FIELDS) {
    const fieldName = OPTIONS_FIELDS[constFieldName]
    storageData[fieldName] = window.localStorage.getItem(fieldName)
  }
  return storageData
}

export { VERSION, OPTIONS_FIELDS, getVersion, getDomainnameFromURL, setExtensionIcon, getAllOptions }
