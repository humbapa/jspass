function getRandomNumber(min, max) {
  const range = max - min
  if (range < 2) {
    throw `Range is too small (${max} - ${min})`
  }
  const randomInt = window.crypto.getRandomValues(new Uint32Array(1))[0]
  return Math.floor(min + range * (randomInt / Math.pow(2, 32)))
}

function getRandomHash(length) {
  if (length < 1) {
    throw `Length is too small (${length})`
  }
  let hashArray = new Uint8Array(length)
  window.crypto.getRandomValues(hashArray)
  let hash = ''
  for (let i = 0; i < length; i++) {
    const randomInt = hashArray[i] % 16
    hash += randomInt.toString(16)
  }
  return hash
}

function getBytesFromRandomHash(hash) {
  const bufferLength = Math.floor(hash.length / 2)
  const buffer = new ArrayBuffer(bufferLength)
  const bufferView = new Uint8Array(buffer)
  let index = 0
  for (var i = 0; i < bufferLength; i++) {
    bufferView[i] = parseInt(`${hash[index]}${hash[index + 1]}`, 16)
    index += 2
  }
  return buffer
}

function getBytesFromString(value) {
  const encoder = new TextEncoder()
  return encoder.encode(value)
}

function createPasswordForDomainname(domain, password, settings) {
  return new Promise((resolve, reject) => {
    const passwordlength = Number(settings.passwordlength)
    window.crypto.subtle
      .importKey(
        'raw',
        getBytesFromString(`${domain}.${password}`),
        {
          name: 'PBKDF2',
        },
        false,
        ['deriveBits', 'deriveKey']
      )
      .then((key) => {
        window.crypto.subtle
          .deriveBits(
            {
              name: 'PBKDF2',
              hash: 'SHA-256',
              salt: getBytesFromRandomHash(settings.salt),
              iterations: Number(settings.iterations),
            },
            key,
            passwordlength * 8
          )
          .then((key) => {
            const letterchars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
            let chars = letterchars

            const numberchars = '0123456789'
            let minnumbers = 0
            if (settings.usenumbers) {
              chars += numberchars
              minnumbers = Number(settings.minnumbers)
            }

            const specialchars = settings.specialchars
            let minspecialchars = 0
            if (settings.usespecialchars) {
              chars += specialchars
              minspecialchars = Number(settings.minspecialchars)
            }

            if (minnumbers + minspecialchars > passwordlength) {
              const minscalefactor = passwordlength / (minnumbers + minspecialchars)
              minnumbers = Math.round(minscalefactor * minnumbers)
              minspecialchars = Math.round(minscalefactor * minspecialchars)

              // Fix rounding, favor specialchars over numbers
              if (minnumbers + minspecialchars > passwordlength) {
                if (minnumbers > 0) {
                  minnumbers -= 1
                } else {
                  minspecialchars -= 1
                }
              } else if (minnumbers + minspecialchars < passwordlength) {
                if (minspecialchars < passwordlength) {
                  minspecialchars += 1
                } else {
                  minnumbers += 1
                }
              }
            }

            let sitepassword = ''
            let lettercharspositions = []
            const numbercharspositions = []
            const specialcharspositions = []
            const keyView = new Uint8Array(key)
            for (let i = 0; i < passwordlength; i++) {
              const newpasswordchar = chars[keyView[i] % chars.length]
              sitepassword += newpasswordchar
              if (letterchars.indexOf(newpasswordchar) !== -1) {
                lettercharspositions.push(i)
              } else if (numberchars.indexOf(newpasswordchar) !== -1) {
                numbercharspositions.push(i)
              } else {
                specialcharspositions.push(i)
              }
            }

            if (minnumbers > numbercharspositions.length && lettercharspositions.length > 0) {
              for (let i = 0, ii = minnumbers - numbercharspositions.length; i < ii; i++) {
                const key = keyView[i]
                const newpasswordchar = numberchars[key % numberchars.length]
                const newpasswordcharposition = lettercharspositions[key % lettercharspositions.length]
                numbercharspositions.push(newpasswordcharposition)
                sitepassword = replaceCharAtPosition(sitepassword, newpasswordchar, newpasswordcharposition)
                lettercharspositions = lettercharspositions.filter((value) => value !== newpasswordcharposition)
              }
            }

            if (minspecialchars > specialcharspositions.length && lettercharspositions.length > 0) {
              for (let i = 0, ii = minspecialchars - specialcharspositions.length; i < ii; i++) {
                const key = keyView[i]
                const newpasswordchar = specialchars[key % specialchars.length]
                const newpasswordcharposition = lettercharspositions[key % lettercharspositions.length]
                specialcharspositions.push(newpasswordcharposition)
                sitepassword = replaceCharAtPosition(sitepassword, newpasswordchar, newpasswordcharposition)
                lettercharspositions = lettercharspositions.filter((value) => value !== newpasswordcharposition)
              }
            }

            resolve(sitepassword)
          })
      })
  })
}

function replaceCharAtPosition(text, char, index) {
  return text.substr(0, index) + char + text.substr(index + 1)
}

function countChars(input, chars) {
  const escapedPattern = chars.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
  return (input.match(new RegExp(`[${escapedPattern}]`, 'g')) || []).length
}

export {
  getRandomNumber,
  getRandomHash,
  getBytesFromRandomHash,
  getBytesFromString,
  createPasswordForDomainname,
  replaceCharAtPosition,
  countChars,
}
