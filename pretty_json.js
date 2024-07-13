const fs = require('fs');
const path = require('path');
const { CleanupHelper } = require('./CleanupHelper');

function isRawDataFile(path) {
	return /[\\\/]\d+$/.test(path);
}
function isFullDataFile(path) {
	return /_full\.json$/.test(path);
}

const cleanupHelper = new CleanupHelper();

function processFileSync(filePath) {
	try {
		const isFull = isFullDataFile(filePath);
		if (!isFull && !isRawDataFile(filePath)) {
			return false;
		}
		const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		let fileName = path.basename(filePath, path.extname(filePath));
		if (isFull) {
			fileName = fileName.replace(/_full/, '');
		}
		const baseDir = path.dirname(filePath);
		
		// full, pretty
		if (!isFull) {
			const jsonPath = path.join(baseDir, `${fileName}_full.json`);
			if (!fs.existsSync(jsonPath)) {
				const json = JSON.stringify(data, null, '\t');
				fs.writeFileSync(jsonPath, json);
				// buggy?
				if (json.length < 100) {
					console.warn(`Invalid/short data in ${jsonPath}`);
					return false;
				}
			}
		}

		// short
		const shortPath = path.join(baseDir, `${fileName}_short.json`);
		const shortData = cleanupHelper.shorten(data);
		fs.writeFileSync(shortPath, JSON.stringify(shortData, null, '\t'));

		// done = delete
		if (!isFull) {
			fs.unlinkSync(filePath);
		}

		// console.log(`Saved ${jsonPath}`);
		return true;
	} catch (err) {
		console.error(`Error processing file ${filePath}:`, err);
	}
}

function processDirectorySync(directoryPath) {
	try {
		console.log(`Processing directory: ${directoryPath}`);
		const files = fs.readdirSync(directoryPath);

		files.forEach((file) => {
			const fullPath = path.join(directoryPath, file);
			const stats = fs.statSync(fullPath);

			if (stats.isDirectory()) {
				processDirectorySync(fullPath);
			} else if (stats.isFile()) {
				processFileSync(fullPath);
			}
		});
	} catch (err) {
		console.error(`Error processing directory ${directoryPath}:`, err);
	}
}

// const targetDirectory = path.join('.', 'json', '000-009', '006k');
const targetDirectory = path.join('.', 'json');
processDirectorySync(targetDirectory);
