(function()
{
	let elements = document.querySelectorAll('#nav-tree li.namespace');

	for (let i = 0; i < elements.length; i++)
	{
		let element = elements[i];
		let key = 'ns_' + (i + 1) + '.collapsed';
		let collapsed = sessionStorage.getItem(key);

		if (collapsed)
		{
			element.classList.remove('expanded');
			element.classList.add('collapsed');
		}

		element.addEventListener('click', onNamespaceElementClicked.bind(this, element, key));
	}

	function onNamespaceElementClicked(element, key, evt)
	{
		if (evt.target.parentNode == element && evt.target != element.querySelector('ul'))
		{
			if (element.classList.contains('expanded'))
			{
				element.classList.remove('expanded');
				element.classList.add('collapsed');
				sessionStorage.setItem(key, 'true');
			}
			else if (element.classList.contains('collapsed'))
			{
				element.classList.remove('collapsed');
				element.classList.add('expanded');
				sessionStorage.removeItem(key);
			}
		}
	}
})();

(function()
{
	let menu = document.querySelector('#nav-tree');
	let handle = document.querySelector('#nav-handle');
	let content = document.querySelector('#content');
	let drag = null;

	const MIN_WIDTH = menu.offsetWidth;
	const MAX_WIDTH = content.offsetWidth;

	let menuWidth = sessionStorage.getItem('menu.width');

	if (menuWidth)
	{
		menu.style.setProperty('flex-basis', menuWidth);
	}

	handle.addEventListener('mousedown', onHandleDown);

	function onHandleDown(evt)
	{
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		drag = {
			originX: evt.screenX,
			originWidth: menu.offsetWidth
		};
	}

	function onMouseMove(evt)
	{
		let dragWidth = drag.originWidth + evt.screenX - drag.originX;

		menuWidth = ((dragWidth < MIN_WIDTH) ? MIN_WIDTH : (dragWidth > MAX_WIDTH) ? MAX_WIDTH : dragWidth) + 'px';

		menu.style.setProperty('flex-basis', menuWidth);
		sessionStorage.setItem('menu.width', menuWidth);
		evt.preventDefault();
	}

	function onMouseUp(evt)
	{
		onMouseMove(evt);

		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);

		drag = null;
	}
})();