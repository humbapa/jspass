chrome.runtime.onMessage.addListener((message, sender, response) => {
  const allPasswordFields = document.querySelectorAll('input[type=password]')

  if (allPasswordFields.length === 1) {
    allPasswordFields[0].value = message
    response(true)
  }

  response(false)
})
