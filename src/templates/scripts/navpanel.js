'use strict';

/**
 * Navigation panel controller.
 * Handles foldout items across pages and resizing of the panel.
 */

export default class NavPanel
{
	/**
	 * Active drag information.
	 * @typedef DragInfo
	 * @property {Number} beginX - The mouse screen position when the drag begun.
	 * @property {Number} beginWidth - The width when the drag begun.
	 * @property {Function} mouseMoveListener - The mouse move event listener used by the drag.
	 * @property {Function} mouseUpListener - The mouse move event listener used by the drag.
	 */

	/**
	 * Current drag properties.
	 * @type {DragInfo}
	 */

	#drag = null;

	/**
	 * Initializes a new NavPanel.
	 * @param {HTMLElement} element - Root element of the NavPanel.
	 * @param {HTMLElement} handleElement - Element used to resize the NavPanel.
	 * @param {NodeListOf<Element>} foldoutElements - Elements that can be expanded and collapsed.
	 * @param {String} widthProperty - CSS property name to use when setting the NavPanel's width.
	 * @param {Number} minWidth - Minimum width allowed for the NavPanel.
	 * @param {Number} maxWidth - Maximum width allowed for the NavPanel.
	 */

	constructor(element, handleElement, foldoutElements, widthProperty, minWidth, maxWidth)
	{
		/**
		 * The root element of the nav panel.
		 * @type {HTMLElement}
		 */

		this.element = element;

		/**
		 * The element used to resize the nav panel
		 * @type {HTMLElement}
		 */

		this.handleElement = handleElement;

		/**
		 * The elements that can be expanded and collapsed.
		 * @type {NodeListOf<Element>}
		 */

		this.foldoutElements = foldoutElements;

		/**
		 * Name of the CSS property to use when setting the nav panel's width.
		 * @type {String}
		 */

		this.widthProperty = widthProperty;

		/**
		 * The minimum width allowed for the nav panel.
		 * @type {Number}
		 */

		this.minWidth = minWidth;

		/**
		 * The maximum width allowed for the nav panel.
		 * @type {Number}
		 */

		this.maxWidth = maxWidth;

		this.#initFoldouts();
		this.#initResize();
	}

	#initFoldouts()
	{
		let foldoutElements = this.foldoutElements;

		for (let i = 0; i < foldoutElements.length; i++)
		{
			let foldoutElement = foldoutElements[i];
			let storageKey = 'ns_' + (i + 1) + '.collapsed';
			let collapsed = sessionStorage.getItem(storageKey);

			if (collapsed)
			{
				foldoutElement.classList.remove('expanded');
				foldoutElement.classList.add('collapsed');
			}

			foldoutElement.addEventListener('click', this.#onFoldoutElementClicked.bind(this, foldoutElement, storageKey));
		}
	}

	#onFoldoutElementClicked(foldoutElement, storageKey, evt)
	{
		if (evt.target.parentNode == foldoutElement && evt.target != foldoutElement.querySelector('ul'))
		{
			if (foldoutElement.classList.contains('expanded'))
			{
				foldoutElement.classList.remove('expanded');
				foldoutElement.classList.add('collapsed');
				sessionStorage.setItem(storageKey, 'true');
			}
			else if (foldoutElement.classList.contains('collapsed'))
			{
				foldoutElement.classList.remove('collapsed');
				foldoutElement.classList.add('expanded');
				sessionStorage.removeItem(storageKey);
			}
		}
	}

	#initResize()
	{
		let width = sessionStorage.getItem('menu.width');

		if (width)
		{
			this.element.style.setProperty(this.widthProperty, width);
		}

		this.handleElement.addEventListener('mousedown', this.#onHandleMouseDown.bind(this));
	}

	#onHandleMouseDown(evt)
	{
		let drag = {
			beginX: evt.screenX,
			beginWidth: this.element.offsetWidth,
			mouseMoveListener: this.#onMouseMove.bind(this),
			mouseUpListener: this.#onMouseUp.bind(this)
		};

		this.#drag = drag;

		window.addEventListener('mousemove', drag.mouseMoveListener);
		window.addEventListener('mouseup', drag.mouseUpListener);
	}

	#onMouseMove(evt)
	{
		let drag = this.#drag;
		let minWidth = this.minWidth;
		let maxWidth = this.maxWidth;
		let dragWidth = drag.beginWidth + evt.screenX - drag.beginX;

		let width = ((dragWidth < minWidth) ? minWidth : (dragWidth > maxWidth) ? maxWidth : dragWidth) + 'px';

		this.element.style.setProperty(this.widthProperty, width);
		sessionStorage.setItem('menu.width', width);
		evt.preventDefault();
	}

	#onMouseUp(evt)
	{
		this.#onMouseMove(evt);

		let drag = this.#drag;

		window.removeEventListener('mousemove', drag.mouseMoveListener);
		window.removeEventListener('mouseup', drag.mouseUpListener);

		this.#drag = null;
	}
}

(function()
{
	let contentElement = document.querySelector('#content');

	let navPanelElement = document.querySelector('#nav-tree');
	let navPanelHandleElement = document.querySelector('#nav-handle');
	let navPanelFoldoutElements = document.querySelectorAll('#nav-tree li.namespace');
	let navPanelWidthProperty = 'flex-basis';
	let navPanelMinWidth = navPanelElement.offsetWidth;
	let navPanelMaxWidth = contentElement.offsetWidth;

	let currentItemElement = navPanelElement.querySelector('.this, .member');

	if (currentItemElement)
	{
		currentItemElement.scrollIntoView({block: 'center'});
	}

	new NavPanel(navPanelElement, navPanelHandleElement, navPanelFoldoutElements, navPanelWidthProperty, navPanelMinWidth, navPanelMaxWidth);
})();