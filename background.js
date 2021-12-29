import { getDomainnameFromURL, setExtensionIcon } from './modules/jspass.js'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  getDomainnameFromURL(tab.url).then((domainname) => {
    setExtensionIcon(domainname)
  })
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    getDomainnameFromURL(tab.url).then((domainname) => {
      setExtensionIcon(domainname)
    })
  })
})
