import path from 'path'

export const resolve = path.resolve

export const extname = (filePath) => {
  return '.' + filePath
    .split('/')
    .pop()
    .split('.')
    .slice(1)
    .join('.')
}
