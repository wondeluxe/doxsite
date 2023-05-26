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
				console.log('collapse');
				element.classList.remove('expanded');
				element.classList.add('collapsed');
				sessionStorage.setItem(key, 'true');
			}
			else if (element.classList.contains('collapsed'))
			{
				console.log('expand');
				element.classList.remove('collapsed');
				element.classList.add('expanded');
				sessionStorage.removeItem(key);
			}
		}
	}
})();

(function()
{
	let handle = document.querySelector('#nav-handle');

	// Need to capture bound function.
	// handle.addEventListener('mousedown', onHandleDown.bind(this));

	function onHandleDown(evt)
	{
		// TODO
	}

	function onMouseMove(evt)
	{

	}

	function onMouseUp(evt)
	{

	}
})();