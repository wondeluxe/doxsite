'use strict';

import apiloader from './classes/apiloader.js';
import docbuildertemplates from './classes/docbuildertemplates.js';
import docbuilder from './classes/docbuilder.js';
import fs from 'fs';
import childProcess from 'child_process';

export const APILoader = apiloader;
export const DocBuilderTemplates = docbuildertemplates;
export const DocBuilder = docbuilder;

export class Doxsite
{
	/**
	 * Run Doxygen from the command line and build the documentation site.
	 * @param {String} doxyfile - Path to the Doxyfile.
	 * @param {Object} [buildConfig] - Configuration options to build the doc site with.
	 * @param {String} [buildConfig.xmlPath='XML'] - Path to XML generated by Doxygen. Output location is defined by the `OUTPUT_DIRECTORY` and `XML` options in the Doxyfile.
	 * @param {String} [buildConfig.xmlIndexFile='index.xml'] - Filename for of the index xml file generated by Doxygen. Located in the `xmlPath` folder.
	 * @param {String|Object} [buildConfig.templates] - Templates used to generate documentation files. Either a string path to a JSON file or JSON data containing `filePath` and `files` properties. Default templates used if omitted.
	 * @param {String} [buildConfig.outputPath='API'] - Path the documentation files are written to.
	 * @param {String} [buildConfig.outputFileExtension='html'] - File extension documentation files use, typically html, but could also be php.
	 * @param {String} [buildConfig.urlRootPath='/'] - URL path to the documentation site root on the server/hosting environment.
	 * @param {String} [buildConfig.apiSubPath='API'] - Relative path from `urlRootPath` to the documentation files.
	 */

	static runBuild(doxyfile, buildConfig)
	{
		Doxsite.runDoxygen(doxyfile);
		Doxsite.buildDocs(buildConfig);
	}

	/**
	 * Run Doxygen on the command line.
	 * @param {String} [doxyfile] - Path to the Doxyfile. If no file is provided, Doxygen will attempt to run with a file named Doxyfile in the current working directory.
	 */

	static runDoxygen(doxyfile)
	{
		childProcess.execSync(doxyfile ? ('doxygen ' + doxyfile) : 'doxygen');
	}

	/**
	 * Build documentation files using previously generated xml from Doxygen.
	 * This method can be re-run on its own after modifiying template files to reduce build time.
	 * @param {Object} [config] - Configuration options to build the doc site with.
	 * @param {String} [config.xmlPath='XML'] - Path to XML generated by Doxygen. Output location is defined by the `OUTPUT_DIRECTORY` and `XML` options in the Doxyfile.
	 * @param {String} [config.xmlIndexFile='index.xml'] - Filename for of the index xml file generated by Doxygen. Located in the `xmlPath` folder.
	 * @param {String|Object} [config.templates] - Templates used to generate documentation files. Either a string path to a JSON file or JSON data containing `filePath` and `files` properties. Default templates used if omitted.
	 * @param {String} [config.outputPath='API'] - Path the documentation files are written to.
	 * @param {String} [config.outputFileExtension='html'] - File extension documentation files use, typically html, but could also be php.
	 * @param {String} [config.urlRootPath='/'] - URL path to the documentation site root on the server/hosting environment.
	 * @param {String} [config.apiSubPath='API'] - Relative path from `urlRootPath` to the documentation files.
	 */

	static buildDocs(config)
	{
		console.log('Build docs', config);

		if (!config)
		{
			config = {};
		}

		console.log('Load API...');

		let apiLoader = new APILoader();
		apiLoader.xmlPath = config.xmlPath || 'XML';
		apiLoader.xmlIndexFile = config.xmlIndexFile || 'index.xml';
		apiLoader.addEventListener('loaded', (evt) => { console.log('API loaded!', evt); });
		apiLoader.load();

		console.log('...API loaded.');
		console.log('Build docs...');

		let docBuilder = new DocBuilder();
		docBuilder.namespaces = apiLoader.namespaces;
		docBuilder.definitions = apiLoader.definitions;
		docBuilder.templates = (typeof(config.templates) == 'string') ? DocBuilderTemplates.fromFile(config.templates) : config.templates ? DocBuilderTemplates.fromJSON(config.templates) : Doxsite.#getDefaultTempaltes();
		docBuilder.outputPath = config.outputPath || 'API';
		docBuilder.outputFileExtension = config.outputFileExtension || 'html';
		docBuilder.urlRootPath = config.urlRootPath || '/';
		docBuilder.apiSubPath = config.apiSubPath || 'API';
		docBuilder.addEventListener('complete', (evt) => { console.log('Doc build complete!', evt); });
		docBuilder.buildDocs();

		console.log('Docs built!');
	}

	/**
	 * Create a new project at a specified path. Creates a 'doxygen' folder containing a Doxyfile and XML folder for Doxygen output, and a 'develop'
	 * folder for the site with a default stylesheet.
	 * @param {String} [projectPath] - Path to create the project at. If no path is provided the project will be created in the current working directory.
	 */

	static createProject(projectPath)
	{
		projectPath = Doxsite.#resolvePath(projectPath);

		// meta url is the file path including the file:// protocol.
		// Regex matches file path (index 1) and file name (index 2).

		let file = import.meta.url.match(/^file:\/\/(.+)\/([^\/]+)$/);
		let templatePath = file[1] + '/templates';

		let mkdirOptions = { recursive: true };

		fs.mkdirSync(projectPath + '/doxygen/XML', mkdirOptions);
		fs.mkdirSync(projectPath + '/develop/API', mkdirOptions);
		fs.mkdirSync(projectPath + '/develop/styles', mkdirOptions);
		fs.mkdirSync(projectPath + '/develop/scripts', mkdirOptions);
		fs.mkdirSync(projectPath + '/templates/html', mkdirOptions);

		let copyFile = (src, dest) => {
			try
			{
				fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
			}
			catch (err)
			{
				if (err.code != 'EEXIST')
				{
					throw err;
				}
			}
		};

		copyFile(templatePath + '/Doxyfile', projectPath + '/doxygen/Doxyfile');
		copyFile(templatePath + '/documentation.css', projectPath + '/develop/styles/documentation.css');
		copyFile(templatePath + '/nav.js', projectPath + '/develop/scripts/nav.js');
		copyFile(templatePath + '/templates.json', projectPath + '/templates/templates.json');

		let htmlFiles = fs.readdirSync(templatePath + '/html');

		for (let f = 0; f < htmlFiles.length; f++)
		{
			copyFile(templatePath + '/html/' + htmlFiles[f], projectPath + '/templates/html/' + htmlFiles[f]);
		}
	}

	static #getDefaultTempaltes()
	{
		let file = import.meta.url.match(/^file:\/\/(.+)\/([^\/]+)$/);
		let templateFile = file[1] + '/templates/templates.json';

		return DocBuilderTemplates.fromFile(templateFile);
	}

	static #resolvePath(path)
	{
		if (!path)
		{
			path = process.env.PWD;
		}
		else if (path.indexOf('/') != 0)
		{
			path = process.env.PWD + '/' + path;
		}

		return path.replace(/\/+$/, '');
	}
}