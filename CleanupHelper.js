class CleanupHelper {
	constructor() {
		/** Keep propeties like that in a main object. */
		this.keys = {
			"id": 6428,
			"imie1": "Kaja",
			"imie2": null,
			"nazwisko": "Pietsch",
			"glownyStopienNaukowy": "prof.",
			"pelenTytul": "prof. dr hab. inż.",
			// "zmarl": null,
			"klasyfikacjaKbnP": "górnictwo i geologia inżynierska",
			"specjalnoscP": "geofizyka stosowana",
			"krajP": null,
		};
		/** Skip array-propeties like that in a main object. */
		this.skipKeys = {
			"maile": [],
			"praceBadawcze": [],
			"publikacje":  [],
		};
		/** Keep keys of objects in an array. */
		this.keysArray = {
			//zatrudnienie
			"stanowiskoP": "profesor zwyczajny",
			"dataOd": "2011/06/15",
			"dataDo": null,
			"instytucjaP": "Akademia Górniczo-Hutnicza im. Stanisława Staszica w Krakowie; Wydział Geologii, Geofizyki i Ochrony Środowiska; Katedra Geofizyki",
			//funkcje
			// "dataOd": "2015",
			"funkcjaP": "Członek Prezydium",
			// "instytucjaP": "Polska Akademia Nauk; Wydziały Polskiej Akademii Nauk; Wydział III Nauk Ścisłych i Nauk o Ziemi; Komitet Geofizyki",
			//czlonkostwo
			"rodzajCzlonkostwaP": "Członek",
			"rokPrzystapienia": 2007,
			"rokWystapienia": null,
			// "instytucjaP": "Polska Akademia Nauk; Wydziały PAN; Wydział VII - Nauk o Ziemi i Nauk Górniczych; Komitet Narodowy do spraw  Współpracy z Międzynarodowym Kontynentalnym Programem Głębokich Wierceń (ICDP)",
			//ukonczoneStudia				
			"rokUkonczenia": 1953,
			"kierunek": "medycyna",
			"uczelnia": "Akademia Medyczna w Warszawie",
		};
	}

	shorten(data) {
		const short = {};
		for (const key in data) {
			if (!Object.hasOwnProperty.call(data, key)) {
				continue;
			}
			const value = data[key];
			if (value === null) {
				continue;
			}
			if (key in this.keys) {
				short[key] = value;
			} else if (Array.isArray(value)) {
				if (key in this.skipKeys) {
					if (value.length) {
						short[key] = value.length;
					}
					continue;
				}
				const shortArray = this.shortenArray(value);
				if (shortArray && shortArray.length) {
					short[key] = shortArray;
				}
			}
		}
		return short;
	}

	shortenArray(arr) {
		const result = [];
		for (const data of arr) {
			// skip e.g. array of e-mails
			if (typeof data !== 'object') {
				continue;
			}
			const short = {};
			let hasData = false;
			for (const key in data) {
				if (!Object.hasOwnProperty.call(data, key)) {
					continue;
				}
				const value = data[key];
				if (value === null) {
					continue;
				}
				if (key.startsWith('id') || key in this.keysArray) {
					short[key] = value;
					hasData = true;
				}
			}
			if (hasData) {
				result.push(short);
			}
		}
		return result;
	}
}

exports.CleanupHelper = CleanupHelper;
