const VERSION = 2.1

const OPTIONS_FIELDS = {
  VERSION: 'version',
  ITERATIONS: 'iterations',
  SALT: 'salt',
  SPECIALCHARS: 'specialchars',
  MYDOMAINS: 'mydomains',
  PASSWORDLENGTH: 'passwordlength',
}

async function getVersion() {
  const item = await chrome.storage.local.get([OPTIONS_FIELDS.VERSION])
  if (item[OPTIONS_FIELDS.VERSION]) {
    return parseFloat(item[OPTIONS_FIELDS.VERSION])
  } else {
    try {
      // try old storage (version < 2.1)
      const version = window.localStorage.getItem(OPTIONS_FIELDS.VERSION)
      if (!version) {
        return 0
      }
      return parseFloat(version)
    } catch {
      return 0
    }
  }
}

async function getDomainnameFromURL(url) {
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
      const item = await chrome.storage.local.get([OPTIONS_FIELDS.MYDOMAINS])
      if (item[OPTIONS_FIELDS.MYDOMAINS]) {
        const mydomainspieces = item[OPTIONS_FIELDS.MYDOMAINS].split(',')
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
    chrome.storage.sync.get([domainname], (item) => {
      if (item[domainname]) {
        chrome.action.setIcon({ path: 'resources/icon_active19.png' })
      } else {
        chrome.action.setIcon({ path: 'resources/icon19.png' })
      }
    })
  } else {
    chrome.action.setIcon({ path: 'resources/icon19.png' })
  }
}

async function getAllOptions() {
  const keys = []
  for (const constFieldName in OPTIONS_FIELDS) {
    keys.push(OPTIONS_FIELDS[constFieldName])
  }
  const items = await chrome.storage.local.get(keys)
  return items
}

export { VERSION, OPTIONS_FIELDS, getVersion, getDomainnameFromURL, setExtensionIcon, getAllOptions }
