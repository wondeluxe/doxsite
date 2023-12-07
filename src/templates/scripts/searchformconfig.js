'use strict';

import searchdata from './searchdata.js';
import SearchProvider from './searchprovider.js';
import SearchForm from './searchform.js';

(function()
{
	let searchFormElement = document.getElementById('documentation-search-form');
	let searchProvider = new SearchProvider(searchdata);
	let searchSuggestionLimit = 10;

	new SearchForm(searchFormElement, searchProvider, searchSuggestionLimit);
})();