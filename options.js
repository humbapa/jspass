import { getRandomHash, getRandomNumber } from './modules/crypto.js'
import { getValue, setValue, setValuesFromLocalStorage, setTextContent, isNullOrWhitespace, isInteger } from './modules/form.js'
import { VERSION, OPTIONS_FIELDS, getVersion } from './modules/jspass.js'

const INFO_FIELD = 'info'
const STATUS_FIELD = 'status'

document.addEventListener('DOMContentLoaded', (event) => {
  restoreOptions()
  document.getElementById('optionsform').addEventListener('submit', (event) => {
    event.preventDefault()
    storeOptions()
  })
})

const restoreOptions = () => {
  if (getVersion() === 0) {
    setTextContent(
      INFO_FIELD,
      'Please test your settings before using them for real sites. If you change them later, your generated passwords will also change!'
    )
    setValue(OPTIONS_FIELDS.SALT, getRandomHash(256))
    setValue(OPTIONS_FIELDS.ITERATIONS, getRandomNumber(1000, 10000))
    setTextContent(STATUS_FIELD, 'Using initial random values for salt and iterations. Please refresh the page to generate new ones.')
  } else {
    setValuesFromLocalStorage(OPTIONS_FIELDS)
  }
}

const storeOptions = () => {
  let salt = getValue(OPTIONS_FIELDS.SALT)
  const passwordlength = getValue(OPTIONS_FIELDS.PASSWORDLENGTH)
  const iterations = getValue(OPTIONS_FIELDS.ITERATIONS)
  const mydomains = getValue(OPTIONS_FIELDS.MYDOMAINS)
  let specialchars = getValue(OPTIONS_FIELDS.SPECIALCHARS)

  if (isNullOrWhitespace(salt)) {
    setTextContent(STATUS_FIELD, "Salt can't be empty.")
    return
  }
  if (!isInteger(passwordlength) || passwordlength < 4) {
    setTextContent(STATUS_FIELD, "Password length can't be empty, must be a number and bigger than 4.")
    return
  }
  if (!isInteger(iterations) || iterations <= 0) {
    setTextContent(STATUS_FIELD, "Iterations can't be empty and must be a number.")
    return
  }
  if (isNullOrWhitespace(specialchars)) {
    setTextContent(STATUS_FIELD, "Special chars can't be empty.")
    return
  }

  const originalSaltLength = salt.length
  const originalSpecialCharsLength = specialchars.length
  salt = salt.toLowerCase().replace(/[^a-f0-9]/g, '')
  specialchars = specialchars.replace(/[\s\n\ra-zA-Z0-9]/g, '')

  window.localStorage.setItem(OPTIONS_FIELDS.VERSION, VERSION)
  window.localStorage.setItem(OPTIONS_FIELDS.SALT, salt)
  window.localStorage.setItem(OPTIONS_FIELDS.PASSWORDLENGTH, parseInt(passwordlength))
  window.localStorage.setItem(OPTIONS_FIELDS.ITERATIONS, iterations)
  window.localStorage.setItem(OPTIONS_FIELDS.MYDOMAINS, mydomains.toLowerCase())
  window.localStorage.setItem(OPTIONS_FIELDS.SPECIALCHARS, specialchars)

  if (salt.length !== originalSaltLength || specialchars.length !== originalSpecialCharsLength) {
    setValue(OPTIONS_FIELDS.SALT, salt)
    setValue(OPTIONS_FIELDS.SPECIALCHARS, specialchars)
    setTextContent(STATUS_FIELD, 'One or more not allowed characters have been removed. Please recheck and save again.')
  } else {
    setTextContent(STATUS_FIELD, 'Settings successfully saved.')
  }
}
