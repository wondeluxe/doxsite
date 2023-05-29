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

	console.log('menu.width', menuWidth);

	if (menuWidth)
	{
		// menu.style.width = menuWidth;
		// menu.style.setProperty('width', menuWidth);

		menu.style.setProperty('flex-basis', menuWidth);

		// console.log('menu.style.width', menu.style.width);
		// console.log('menu.offsetWidth', menu.offsetWidth);

		// setTimeout(() => {
		// 	menu.style.setProperty('width', menuWidth);
		// 	// console.log('setMenuWidth', menu.style.width);
		// 	// console.log('menu.offsetWidth', menu.offsetWidth);
		// }, 1000);
	}

	handle.addEventListener('mousedown', onHandleDown);

	function onHandleDown(evt)
	{
		// console.log('onHandleDown', evt);
		// console.log('menu', menu);

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		drag = {
			originX: evt.screenX,
			originWidth: menu.offsetWidth
		};

		console.log('drag', drag);
	}

	function onMouseMove(evt)
	{
		// let dragWidth = Math.floor(drag.originWidth + evt.screenX - drag.originX);
		let dragWidth = drag.originWidth + evt.screenX - drag.originX;

		// menuWidth = Math.max(Math.floor(drag.originWidth + evt.screenX - drag.originX), MIN_WIDTH) + 'px';
		// menu.style.width = menuWidth;

		menuWidth = ((dragWidth < MIN_WIDTH) ? MIN_WIDTH : (dragWidth > MAX_WIDTH) ? MAX_WIDTH : dragWidth) + 'px';

		// menu.style.setProperty('width', menuWidth);
		menu.style.setProperty('flex-basis', menuWidth);

		// if (menu.offsetWidth != parseInt(menuWidth))
		// {
		// 	console.warn('Target width (' + menuWidth + ') not set. Use value:', menu.offsetWidth);
		// }

		sessionStorage.setItem('menu.width', menuWidth);
		evt.preventDefault();
	}

	function onMouseUp(evt)
	{
		// console.log('onMouseUp', evt);

		onMouseMove(evt);

		console.log('storedWidth', sessionStorage.getItem('menu.width'));
		console.log('offsetWidth', menu.offsetWidth);

		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);

		drag = null;
	}

	function clamp(value, min, max)
	{
		return (value < min) ? min : (value > max) ? max : value;
	}
})();