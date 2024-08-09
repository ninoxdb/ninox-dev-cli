import fs from 'fs'
const readmeFilename = 'README.md'
fs.readFile(readmeFilename, 'utf8', function (err, data) {
  if (err) {
    return console.log(err)
  }
  var result = data.replace(/database (download|upload|list) ENV/g, 'ENV database $1')

  fs.writeFile(readmeFilename, result, 'utf8', function (err) {
    if (err) return console.log(err)
  })
})
