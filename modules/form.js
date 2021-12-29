function getValue(fieldId) {
  const formField = document.getElementById(fieldId)
  if (formField) {
    return formField.value.trim()
  }
  return undefined
}

function setValue(fieldId, value) {
  const formField = document.getElementById(fieldId)
  if (formField) {
    formField.value = value
  }
}

function setValueFromLocalStorage(fieldId) {
  chrome.storage.local.get([fieldId], (items) => {
    let value = ''
    if (items[fieldId]) {
      value = items[fieldId]
    }
    setValue(fieldId, value)
  })
}

function setValuesFromLocalStorage(fieldObject) {
  for (const fieldName in fieldObject) {
    setValueFromLocalStorage(fieldObject[fieldName])
  }
}

function setTextContent(fieldId, text) {
  const formField = document.getElementById(fieldId)
  if (formField) {
    formField.textContent = text
  }
}

function isNullOrWhitespace(value) {
  return !value || !value.trim()
}

function isInteger(value) {
  return Number.isInteger(parseInt(value))
}

export { getValue, setValue, setValueFromLocalStorage, setValuesFromLocalStorage, setTextContent, isNullOrWhitespace, isInteger }
