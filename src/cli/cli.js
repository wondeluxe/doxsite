#!/usr/bin/env node

'use strict';

import { Doxsite } from '../doxsite.js';
import fs from 'fs';

// import shell from 'shelljs';

// console.log('doxsite (cli)');
// console.log('argv', process.argv);
// console.log('env', process.env);
// console.log('pwd', process.env.PWD);

if (process.argv[2] == '-h' || process.argv[2] == '--help')
{
	let file = import.meta.url.match(/^file:\/\/(.+)\/([^\/]+)$/);
	let path = file[1];

	console.log(fs.readFileSync(path + '/man.txt', { encoding: 'UTF-8' }));
}
else if (process.argv[2] == '-n' || process.argv[2] == '--new-project')
{
	console.log('Create new project...');
	Doxsite.createProject(process.argv[3] || null);
}
else
{
	let argIsArg = (index) => {
		return (process.argv.length > index) ? !!process.argv[index].match(/^(-h|--help|-n|--new-project|-d|-x|-i|-t|-o|-e|-r|-a)$/) : false;
	};

	let argIsValue = (index) => {
		return (process.argv.length > index) ? !process.argv[index].match(/^(-h|--help|-n|--new-project|-d|-x|-i|-t|-o|-e|-r|-a)$/) : false;
	};

	let args = {};

	for (let i = 2; i < process.argv.length; i++)
	{
		console.log('Process argument ' + i + ': ' + process.argv[i]);

		if (argIsArg(i))
		{
			if (process.argv[i] == '-d')
			{
				args['--run-doxygen'] = true;
			}

			if (argIsValue(i + 1))
			{
				args[process.argv[i]] = process.argv[++i];
			}
		}
	}

	let options = {
		runDoxygen: !!args['--run-doxygen'],
		doxyfile: args['-d']
	};

	let buildConfig = {
		xmlPath: args['-x'],
		xmlIndexFile: args['-i'],
		templates: args['-t'],
		outputPath: args['-o'],
		outputFileExtension: args['-e'],
		urlRootPath: args['-r'],
		apiSubPath: args['-a']
	};

	console.log('Build documentation site', args, options, buildConfig);

	if (options.runDoxygen)
	{
		Doxsite.runBuild(options.doxyfile, buildConfig);
	}
	else
	{
		Doxsite.buildDocs(buildConfig);
	}
}