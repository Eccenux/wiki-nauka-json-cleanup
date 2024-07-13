const path = require('path');
const { JsonPrettifier } = require('./JsonPrettifier');

const baseDir = path.join('..', 'processor-io');
const jsonPrettifier = new JsonPrettifier({
	raw: path.join(baseDir, 'json'),
	full: path.join(baseDir, 'full_pretty'),
	short: path.join(baseDir, 'short'),
});

// const subdir = path.join('000-009', '006k');
const subdir = '';
const mode = 'raw';
jsonPrettifier.processDirectorySync(subdir, mode);
