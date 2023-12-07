'use strict';

import Levenshtein from './levenshtein.js';

/**
 * Search information for a documented object.
 * @typedef {Object} SearchDef
 * @property {String} name - Name of the documented object.
 * @property {String} description - Description of the documented object.
 * @property {String} url - Page URL of the documented object.
 */

/**
 * Object used to provide search suggestions and results for a search form.
 */

export default class SearchProvider
{
	/**
	 * Initialize a new {@linkcode SearchProvider}.
	 * @param {Object.<string, SearchDef[]]>} data - Object containing search information for all documented objects in the API.
	 */

	constructor(data)
	{
		/**
		 * Object containing searching information for all documented objects in the API.
		 * @type Object.<string, SearchDef[]]>
		 */

		this.data = data;
	}

	/**
	 * Get suggestions for a given search value.
	 * @param {String} value - The value to find suggestions for.
	 * @param {Number} limit - The maximum number of suggestions to return.
	 * @returns {String[]} The suggestions for {@linkcode value}.
	 */

	getSuggestions(value, limit)
	{
		let data = this.data;

		if (!data)
		{
			return [];
		}

		let regex = new RegExp(value, 'i');
		let values = {};
		let results = [];
		let suggestions = [];

		for (let key in data)
		{
			let index = key.search(regex);

			if (index < 0)
			{
				continue;
			}

			let keyRegex = new RegExp(key, 'i');

			let defs = data[key];

			for (let i = 0; i < defs.length; i++)
			{
				let match = defs[i].name.match(keyRegex)[0];

				if (values[match])
				{
					continue;
				}

				values[match] = true;
				results.push({value: match, index: index, distance: Levenshtein.compare(value, match)});
			}
		}

		results.sort(SearchProvider.#compareResults);

		limit = limit ? Math.min(limit, results.length) : results.length;

		for (let r = 0; r < limit; r++)
		{
			suggestions.push(results[r].value);
		}

		return suggestions;
	}

	search(value)
	{
		let data = this.data;

		if (!data)
		{
			return [];
		}

		let regex = new RegExp(value, 'i');
		let results = [];

		for (let key in data)
		{
			let defs = data[key];

			let index = key.search(regex);

			if (index < 0)
			{
				for (let i = 0; i < defs.length; i++)
				{
					let def = defs[i];

					index = def.name.search(regex);

					if (index < 0)
					{
						continue;
					}

					results.push({
						value: def.name,
						description: def.description,
						url: def.url,
						index: index,
						distance: Levenshtein.compare(value, def.name)
					});
				}
			}
			else
			{
				let keyRegex = new RegExp(key, 'i');

				for (let i = 0; i < defs.length; i++)
				{
					let def = defs[i];
					let match = def.name.match(keyRegex)[0];

					results.push({
						value: def.name,
						description: def.description,
						url: def.url,
						index: index,
						distance: Levenshtein.compare(value, match)
					});
				}
			}
		}

		results.sort(SearchProvider.#compareResults);

		return results;
	}

	dispose()
	{
		this.data = null;
	}

	static #compareResults(a, b)
	{
		if (a.index < b.index) return -1;
		if (a.index > b.index) return 1;
		if (a.distance < b.distance) return -1;
		if (a.distance > b.distance) return 1;
		return a.value.localeCompare(b.value);
	}
}