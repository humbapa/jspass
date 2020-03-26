chrome.runtime.onMessage.addListener((message, sender, response) => {
  let result = false
  document.querySelectorAll('input[type=password]').forEach(element => {
    element.value = message
    result = true
  })
  response(result)
})
