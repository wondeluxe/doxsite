'use strict';

import SearchProvider from './searchprovider.js';

export default class SearchForm
{
	/**
	 * Markup for suggestions that appear in the suggestion list. Should be enclosed in a `<li>` tag. Use the variable `$text` to denote where text should be inserted.
	 * The class `highlighted` will be added when the suggestion becomes highlighted/focused either by arrow keys or the mouse.
	 * @type String
	 */

	suggestionMarkup = '<li class="search-suggestion" role="option" tabindex="-1">$text</li>';

	/**
	 * Markup for the portion of a suggestion that has been entered by the user. Use the variable `$text` to denote where text should be inserted.
	 */

	userTextMarkup = '<span class="user-text">$text</span>';

	/**
	 * Markup for the portion of a suggestion that is suggested. Use the variable `$text` to denote where text should be inserted.
	 */

	suggestedTextMarkup = '<span class="suggested-text">$text</span>';

	/**
	 * Last value entered by the user.
	 * @type String
	 */

	#userValue = '';

	/**
	 * The current suggestions based on the user's last entered search value.
	 * @type String[]
	 */

	#suggestions = [];

	/**
	 * Index of the currently active suggestion. Will be `-1` if there is no active suggestion.
	 * @type Number
	 */

	#suggestionIndex = -1;

	/**
	 * Initialize a new SearchForm.
	 * @param {HTMLFormElement} element - Form element of the SearchForm.
	 * @param {SearchProvider} provider - Search provider used to provide suggestions.
	 * @param {Number} suggestionLimit - Maximum number of suggestions to provide.
	 */

	constructor(element, provider, suggestionLimit)
	{
		/**
		 * Form element of the SearchForm. The class `suggesting` will be added when suggestions have been added and should be displayed.
		 * @type HTMLFormElement
		 */

		this.element = element;

		/**
		 * Input element of the SearchForm.
		 * @type HTMLInputElement
		 */

		this.inputElement = element.querySelector('input');

		/**
		 * List element to be populated with search suggestions.
		 * @type HTMLUListElement
		 */

		this.listElement = element.querySelector('ul');

		/**
		 * Clear button element. Clears input on click.
		 * @type HTMLButtonElement
		 */

		this.clearButton = element.querySelector('.clear-button');

		/**
		 * Search button element. Submits the form when clicked.
		 * @type HTMLButtonElement
		 */

		this.searchButton = element.querySelector('.search-button');

		/**
		 * Search provider used to provide suggestions.
		 * @type SearchProvider
		 */

		this.provider = provider;

		/**
		 * Maximum number of suggestions that will be provided.
		 * @type Number
		 */

		this.suggestionLimit = suggestionLimit;

		/**
		 * Are suggestions presented/visible for the user to select?
		 * @type Boolean
		 */

		this.suggesting = false;

		this.inputElement.addEventListener('focus', this.#onFocus.bind(this));
		this.inputElement.addEventListener('blur', this.#onBlur.bind(this));
		this.inputElement.addEventListener('keydown', this.#onKeyDown.bind(this));
		this.inputElement.addEventListener('keyup', this.#onKeyUp.bind(this));
		this.element.addEventListener('reset', this.#onReset.bind(this));
	}

	#refreshSuggestions()
	{
		this.listElement.innerHTML = '';

		let userValue = this.#userValue;

		let suggestions = userValue ? this.provider.getSuggestions(userValue, this.suggestionLimit) : [];

		this.#suggestions = suggestions;

		let searchExpression = new RegExp(userValue, 'i');

		for (let i = 0; i < suggestions.length; i++)
		{
			let suggestion = suggestions[i];

			let index = suggestion.search(searchExpression);

			let text = '';

			if (index < 0)
			{
				text += this.suggestedTextMarkup.replace('$text', suggestion);
			}
			else
			{
				if (index > 0)
				{
					text += this.suggestedTextMarkup.replace('$text', suggestion.substring(0, index));
				}

				text += this.userTextMarkup.replace('$text', suggestion.match(searchExpression)[0]);

				if (index < suggestion.length)
				{
					text += this.suggestedTextMarkup.replace('$text', suggestion.substring(index + userValue.length));
				}
			}

			this.listElement.innerHTML += this.suggestionMarkup.replace('$text', text);
		}

		this.suggesting = !!suggestions.length;

		if (this.suggesting)
		{
			this.element.classList.add('suggesting');
		}
		else
		{
			this.element.classList.remove('suggesting');
		}
	}

	/**
	 * Show a suggestion.
	 * @param {Number} index    Integer representing the index of the suggestion to make active.
	 *                          If `index` is `-1` or greater than or equal to the total number of suggestions any suggestion become deactive,
	 *                          and the input value will revert to the user's entered text.
	 *                          If `index` is less than `-1` the suggestion will be set to the last suggestion in the list.
	 */

	#showSuggestion(index)
	{
		// console.log('Show suggestion', index);

		if (index < -1)
		{
			// Make active suggestion last suggestion.
			index = this.#suggestions.length - 1;
		}
		if (index == -1)
		{
			// Make active suggestion empty.
		}
		else if (index >= this.#suggestions.length)
		{
			// Make active suggestion empty and set suggestion index to -1.
			index = -1;
		}
		else
		{
			// Make active suggestion match the index.
		}

		let prevIndex = this.#suggestionIndex;

		if (index != prevIndex)
		{
			if (prevIndex != -1)
			{
				this.listElement.children[prevIndex].classList.remove('highlighted');
			}

			if (index == -1)
			{
				this.inputElement.value = this.#userValue;
			}
			else
			{
				let suggestion = this.#suggestions[index];
				
				this.inputElement.value = suggestion;
				this.listElement.children[index].classList.add('highlighted');
				this.element.classList.add('suggesting');
				this.suggesting = true;
			}

			this.#suggestionIndex = index;
		}
	}

	#showSuggestions()
	{
		if (!this.suggesting && this.#suggestions.length)
		{
			this.element.classList.add('suggesting');
			this.suggesting = true;
		}
	}

	#hideSuggestions()
	{
		if (this.suggesting)
		{
			if (this.#suggestionIndex > -1)
			{
				this.listElement.children[this.#suggestionIndex].classList.remove('highlighted');
				this.#suggestionIndex = -1;
			}
			
			this.inputElement.value = this.#userValue;
			this.element.classList.remove('suggesting');
			this.suggesting = false;
		}
	}

	/**
	 * Handle focus on the SearchForm's {@linkcode inputElement}.
	 * @param {FocusEvent} evt - The focus event to handle.
	 */

	#onFocus(evt)
	{
		this.#showSuggestions();
	}

	/**
	 * Handle blur (focus lost) on the SearchForm's {@linkcode inputElement}.
	 * @param {FocusEvent} evt - The focus event to handle.
	 */

	#onBlur(evt)
	{
		if (evt.relatedTarget && evt.relatedTarget.parentNode == this.listElement)
		{
			let suggestionIndex = [...this.listElement.children].indexOf(evt.relatedTarget);
			this.#showSuggestion(suggestionIndex);
			evt.stopImmediatePropagation();
			evt.preventDefault();
			this.element.submit();
		}
		else
		{
			this.#hideSuggestions();
		}
	}

	/**
	 * Handle key down on the SearchForm's {@linkcode inputElement}.
	 * @param {KeyboardEvent} evt - The keyboard event to handle.
	 */

	#onKeyDown(evt)
	{
		// console.log('Key "' + evt.key + '" down.', evt, this.inputElement.value);

		let value = this.inputElement.value.trim();

		if (value && this.#suggestions.length)
		{
			// Key is pressed while input has usable value.

			switch (evt.key)
			{
				case 'ArrowDown':
					this.#showSuggestion(this.#suggestionIndex + 1);
					evt.stopImmediatePropagation();
					evt.preventDefault();
					break;
				case 'ArrowUp':
					this.#showSuggestion(this.#suggestionIndex - 1);
					evt.stopImmediatePropagation();
					evt.preventDefault();
					break;
				case 'Escape':
					this.#hideSuggestions();
					evt.stopImmediatePropagation();
					evt.preventDefault();
					break;
				// case 'Enter':
				// 	// Submit form. Handled in markup.
				// 	break;
			}
		}
		else
		{
			// Key is pressed while input is empty or whitespace only.
			// Just use default key behaviour.
		}
	}

	/**
	 * Handle key up on the SearchForm's {@linkcode inputElement}.
	 * @param {KeyboardEvent} evt - The keyboard event to handle.
	 */

	#onKeyUp(evt)
	{
		let value = this.inputElement.value;
		let userValue = this.#userValue;
		let suggestedValue = (this.suggesting && this.#suggestionIndex > -1) ? this.#suggestions[this.#suggestionIndex] : null;

		// console.log('Key "' + evt.key + '" up.', evt, value, suggestedValue);

		// if (this.inputElement.value != this.#userValue)
		if (value != userValue && value != suggestedValue)
		{
			this.#userValue = value;
			this.#refreshSuggestions();
		}

		this.clearButton.disabled = !value;
		this.searchButton.disabled = !value.trim();
	}

	/**
	 * Handle reset of the SearchForm's {@linkcode element}.
	 * @param {Event} evt - The reset event to handle.
	 */

	#onReset(evt)
	{
		// console.log(this.inputElement.value);

		this.#userValue = '';
		this.#refreshSuggestions();

		this.clearButton.disabled = true;
		this.searchButton.disabled = true;

		this.inputElement.focus();
	}
}