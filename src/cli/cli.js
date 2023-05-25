#!/usr/bin/env node

'use strict';

import { Doxsite } from '../doxsite.js';

// TODO Replace shelljs with fs.

// import shell from 'shelljs';

console.log('doxsite (cli)');
console.log('argv', process.argv);
console.log('env', process.env);
console.log('pwd', process.env.PWD);


// TODO Process arguments.
// if (args.createProject)
// {
// 	Doxsite.createProject(projectPath);
// }


// meta url is the file path including the file:// protocol.
// Regex matches file path (index 1) and file name (index 2).

// let file = import.meta.url.match(/^file:\/\/(.+)\/([^\/]+)$/);
// let templateDir = file[1] + '/template';
// let projectDir = (process.argv.length > 2) ? process.argv[2] : process.env.PWD;

// console.log('file', file);
// console.log('templateDir:', templateDir);
// console.log('projectDir:', projectDir);

// shell.mkdir('-p', projectDir + '/doxygen/XML');
// shell.mkdir('-p', projectDir + '/develop/API');
// shell.mkdir('-p', projectDir + '/develop/styles');
// shell.mkdir('-p', projectDir + '/templates');

// shell.cp('-u', templateDir + '/Doxyfile', projectDir + '/doxygen/Doxyfile');
// shell.cp('-u', templateDir + '/documentation.css', projectDir + '/develop/styles/documentation.css');
// shell.cp('-u', templateDir + '/*.html', projectDir + '/templates');

Doxsite.createProject(process.argv.length > 2 ? process.argv[2] : null);