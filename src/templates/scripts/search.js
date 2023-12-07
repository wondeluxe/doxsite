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

	let contentElement = document.getElementById('content');

	let params = new URLSearchParams(window.location.search);
	let searchValue = params.get('q');

	if (searchValue)
	{
		let results = searchProvider.search(searchValue);

		let html = '<h1>' + results.length + ' ' + (results.length == 1 ? ' result' : 'results') + ' found for "' + searchValue + '".</h1>';

		for (let i = 0; i < results.length; i++)
		{
			let result = results[i];

			html += '<div class="search-result">';
			html += '<a href="' + result.url + '">' + result.value + '</a>';// TODO pre-format value into link?
			html += result.description;// Pre-formatted.
			html += '</div>';
		}

		contentElement.innerHTML = html;
	}
	else
	{
		contentElement.innerHTML = '';
	}
})();