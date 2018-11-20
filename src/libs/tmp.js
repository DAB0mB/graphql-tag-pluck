import * as tmp from 'tmp'

export const file = (...args) => new Promise((resolve, reject) => {
  const callback = (err, filename, cleanupCallback) => {
    if (err) {
      reject(err)
    }
    else {
      resolve({
        cleanupCallback,
        name: filename,
      })
    }
  }

  args.push(callback)

  tmp.file(...args)
})

export default {
  file
}
