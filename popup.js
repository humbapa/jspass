import { createPasswordForDomainname } from './modules/crypto.js'
import { getValue, setValue } from './modules/form.js'
import { VERSION, getVersion, getDomainnameFromURL, setExtensionIcon, getAllOptions, OPTIONS_FIELDS } from './modules/jspass.js'

let activetab
document.addEventListener('DOMContentLoaded', event => {
  if (getVersion() != VERSION) {
    chrome.tabs.create({ url: 'options.html' })
    window.close()
    return
  }

  document.getElementById('usenumbers').addEventListener('input', event => {
    setDependentFieldStyle(event.currentTarget.checked, 'minnumbers')
  })

  document.getElementById('usespecialchars').addEventListener('input', event => {
    setDependentFieldStyle(event.currentTarget.checked, 'minspecialchars')
  })

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length < 1) {
      window.close()
      return
    }

    document.getElementById('passwordlength').value = window.localStorage.getItem(OPTIONS_FIELDS.PASSWORDLENGTH)

    activetab = tabs[0]
    const domainname = getDomainnameFromURL(activetab.url)
    if (domainname !== '') {
      setValue('domainname', domainname)
      restoreSiteSettings(domainname)
    }
  })

  document.getElementById('popupform1').addEventListener('submit', event => {
    event.preventDefault()
    const masterpassword = getValue('masterpassword')
    const domainname = getValue('domainname')
    if (masterpassword && domainname) {
      document.querySelectorAll('#popupform1 input').forEach(element => {
        element.disabled = true
      })

      // TODO show spinner

      const passwordOptions = getAllOptions()

      const siteSettings = {
        usenumbers: document.getElementById('usenumbers').checked,
        minnumbers: Number(document.getElementById('minnumbers').value),
        usespecialchars: document.getElementById('usespecialchars').checked,
        minspecialchars: Number(document.getElementById('minspecialchars').value),
        autofill: document.getElementById('autofill').checked,
      }

      const passwordLength = document.getElementById('passwordlength').value
      if (passwordLength != passwordOptions[OPTIONS_FIELDS.PASSWORDLENGTH]) {
        siteSettings.passwordlength = Number(passwordLength)
      }

      storeSiteSettings(domainname, siteSettings)

      createPasswordForDomainname(domainname, masterpassword, {
        ...passwordOptions,
        ...siteSettings,
      }).then(sitepassword => {
        if (siteSettings.autofill) {
          chrome.tabs.executeScript(
            {
              file: 'autofill.js',
            },
            results => {
              if (results && results.length === 1) {
                chrome.tabs.sendMessage(activetab.id, sitepassword, response => {
                  if (response) {
                    window.close()
                  } else {
                    showPopupForm2(sitepassword)
                  }
                })
              } else {
                showPopupForm2(sitepassword)
              }
            }
          )
        } else {
          showPopupForm2(sitepassword)
        }
      })
    }
  })

  document.getElementById('popupform2').addEventListener('submit', event => {
    event.preventDefault()
    document.getElementById('sitepassword').focus()
    document.getElementById('sitepassword').select()
    navigator.clipboard.writeText(getValue('sitepassword')).then(() => {
      setValue('sitepassword', '')
      window.close()
    })
  })
})

const restoreSiteSettings = domainname => {
  chrome.storage.sync.get([domainname], item => {
    const siteSettings = item[domainname]
    if (siteSettings) {
      if (siteSettings.passwordlength !== undefined) {
        document.getElementById('passwordlength').value = siteSettings.passwordlength
      }
      if (siteSettings.usenumbers !== undefined) {
        document.getElementById('usenumbers').checked = siteSettings.usenumbers
        setDependentFieldStyle(siteSettings.usenumbers, 'minnumbers')
      }
      if (siteSettings.minnumbers !== undefined) {
        document.getElementById('minnumbers').value = siteSettings.minnumbers
      }
      if (siteSettings.usespecialchars !== undefined) {
        document.getElementById('usespecialchars').checked = siteSettings.usespecialchars
        setDependentFieldStyle(siteSettings.usespecialchars, 'minspecialchars')
      }
      if (siteSettings.minspecialchars !== undefined) {
        document.getElementById('minspecialchars').value = siteSettings.minspecialchars
      }
      if (siteSettings.autofill !== undefined) {
        document.getElementById('autofill').checked = siteSettings.autofill
      }
    }
  })
}

const storeSiteSettings = (domainname, settings) => {
  const domainoptions = {}
  domainoptions[domainname] = settings
  chrome.storage.sync.set(domainoptions, () => {
    setExtensionIcon(domainname)
  })
}

const showPopupForm2 = password => {
  setValue('sitepassword', password)
  document.getElementById('popupform1').style.display = 'none'
  document.getElementById('popupform2').style.display = 'inline'
  document.getElementById('sitepassword').focus()
  document.getElementById('sitepassword').select()
}

const setDependentFieldStyle = (status, dependentFieldname) => {
  const dependentField = document.getElementById(dependentFieldname)
  if (status) {
    dependentField.readOnly = false
    dependentField.parentElement.style.opacity = 'initial'
  } else {
    dependentField.readOnly = true
    dependentField.parentElement.style.opacity = 0.4
  }
}
