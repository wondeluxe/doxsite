'use strict';

import { Doxsite } from './doxsite.js';

Doxsite.runBuild('Documentation/doxygen/Doxyfile', {
	xmlPath: 'Documentation/doxygen/XML',
	templates: 'Documentation/templates/templates.json',
	outputPath: 'Documentation/develop/API',
	urlRootPath: '/',
	apiSubPath: 'API'
});