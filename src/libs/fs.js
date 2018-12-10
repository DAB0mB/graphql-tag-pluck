import fs from 'fs'

export const readFileSync = fs.readFileSync
export const writeFileSync = fs.writeFileSync

export const readFile = (...args) => {
  return new Promise((resolve, reject) => {
    fs.readFile(...args, (err, content) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(content)
      }
    })
  })
}

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
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
}
