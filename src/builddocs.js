'use strict';

import { Doxsite } from './doxsite.js';

Doxsite.buildDocs({
	xmlPath: 'Documentation/doxygen/XML',
	templates: 'Documentation/templates/templates.json',
	outputPath: 'Documentation/develop',
	urlRootPath: '/',
	apiSubPath: 'API',
	searchdataSubPath: 'scripts'
});