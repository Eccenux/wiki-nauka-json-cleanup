const fs = require('fs');
const path = require('path');
const { CleanupHelper } = require('./CleanupHelper');

function isRawDataFile(file) {
	return /^\d+$/.test(file);
}
function makeMissingDir(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, {recursive:true});
	}
}

const cleanupHelper = new CleanupHelper();

class JsonPrettifier {
	constructor(baseDirectories) {
		this.base = {};
		this.base.raw = baseDirectories.raw;
		this.base.full = baseDirectories.full;
		this.base.short = baseDirectories.short;
	}

	/**
	 * @private
	 * 
	 * @param {String} file Name with extension.
	 * @param {String} subdir Sub-dir of `this.base[mode]`.
	 * @param {String} mode 'raw'/'full'.
	 * @returns true if shortened.
	 */
	processFileSync(file, subdir = '', mode = 'raw') {
		const isFull = mode === 'full';
		if (!isFull && !isRawDataFile(file)) {
			return false;
		}

		// paths
		let filePath = path.join(this.base[mode], subdir, file);
		let fileName = path.basename(file, path.extname(file));
		if (isFull) {
			fileName = fileName.replace(/_full/, '');
		}
		const dir = {
			full: path.join(this.base.full, subdir),
			short: path.join(this.base.short, subdir),
		}
		const out = {
			full: path.join(dir.full, `${fileName}_full.json`),
			short: path.join(dir.short, `${fileName}_short.json`),
		}

		try {
			// read
			const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

			// full, pretty
			if (!isFull) {
				const jsonPath = path.join(out.full);
				if (!fs.existsSync(jsonPath)) {
					const json = JSON.stringify(data, null, '\t');
					makeMissingDir(dir.full);
					fs.writeFileSync(jsonPath, json);
					// buggy?
					if (json.length < 100) {
						console.warn(`Invalid/short data in ${jsonPath}`);
						return false;
					}
				}
			}

			// short
			const shortPath = path.join(out.short);
			const shortData = cleanupHelper.shorten(data);
			makeMissingDir(dir.short);
			fs.writeFileSync(shortPath, JSON.stringify(shortData, null, '\t'));

			// done = delete
			if (!isFull) {
				// fs.unlinkSync(filePath);
			}

			// console.log(`Saved ${jsonPath}`);
			return true;
		} catch (err) {
			console.error(`Error processing file ${filePath}:`, err);
		}
	}

	/**
	 * Process directory.
	 * @param {String} subdir Sub-dir of `this.base[mode]`.
	 * @param {String} mode 'raw'/'full'.
	 */
	processDirectorySync(subdir='', mode='raw') {
		if (!(mode in this.base)) {
			throw `Invalid mode ${mode}`;
		}
		if (subdir.length) {
			console.log(`Processing subdirectory: ${subdir}`);
		}
		let directoryPath = path.join(this.base[mode], subdir);

		try {
			const files = fs.readdirSync(directoryPath);
			let count = 0;

			files.forEach((file) => {
				const fullPath = path.join(directoryPath, file);
				const stats = fs.statSync(fullPath);

				if (stats.isDirectory()) {
					const nextDir = subdir.length ? path.join(subdir, file) : file;
					count += this.processDirectorySync(nextDir, mode);
				} else if (stats.isFile()) {
					const done = this.processFileSync(file, subdir, mode);
					if (done) {
						count++;
					}
				}
			});

			console.log(` Processed subdirectory: ${subdir} [${count}]`);
			return count;
		} catch (err) {
			console.error(`Error processing directory ${directoryPath}:`, err);
		}
		return 0;
	}
}

exports.JsonPrettifier = JsonPrettifier;
