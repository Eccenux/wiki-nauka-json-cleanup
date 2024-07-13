const path = require('path');
const { JsonPrettifier } = require('./JsonPrettifier');

const jsonPrettifier = new JsonPrettifier();

// const targetDirectory = path.join('.', 'json', '000-009', '006k');
const targetDirectory = path.join('..', 'processor-io', 'json');
jsonPrettifier.processDirectorySync(targetDirectory);
