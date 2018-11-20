import fs from 'fs'

export const writeFile = (...args) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(...args, (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve()
      }
    })
  })
}

export default {
  writeFile
}
