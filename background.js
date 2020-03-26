import { getDomainnameFromURL, setExtensionIcon } from './modules/jspass.js'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const domainname = getDomainnameFromURL(tab.url)
  setExtensionIcon(domainname)
})

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    const domainname = getDomainnameFromURL(tab.url)
    setExtensionIcon(domainname)
  })
})
