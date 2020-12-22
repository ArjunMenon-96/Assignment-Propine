const fs = require('fs');

module.exports = html5

function html5() {

    const html5 = fs.readFileSync(`${__dirname}/index.html`)
    fs.writeFileSync(`${process.cwd()}/index.html`, html5)
}

html5()