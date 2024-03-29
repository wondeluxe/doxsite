import APINamespace from './apinamespace.js';
import APIEnum from './apienum.js';
import APIEnumValue from './apienumvalue.js';
import APIObject from './apiobject.js';
import APIReference from './apireference.js';
import APITemplateType from './apitemplatetype.js';
import APIField from './apifield.js';
import APIProperty from './apiproperty.js';
import APIMethod from './apimethod.js';
import APIParameter from './apiparameter.js';
import APIEvent from './apievent.js';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

/**
 * An API definition.
 * @typedef {APINamespace|APIObject|APIField|APIProperty|APIMethod|APIEvent|APIEnum|APIEnumValue|APIParameter} APIDefinition
 */

/**
 * Loads APIObjects from a source index xml file.
 */

export default class APILoader extends EventTarget
{
	// TODO Need to add namespaces in final pass as regex method of assigning them is unreliable.

	#loading = false;
	#objects = [];

	constructor(xmlPath, xmlIndexFile)
	{
		super();

		/**
		 * Path to XML generated by Doxygen.
		 * @type String
		 */

		this.xmlPath = xmlPath || null;

		/**
		 * Filename for of the index xml file generated by Doxygen. Located in the {@linkcode xmlPath} folder.
		 * @type String
		 */

		this.xmlIndexFile = xmlIndexFile || null;

		/**
		 * JSON representation of index xml. Generated during {@linkcode load}.
		 * @type Object
		 */

		this.json = null;

		/**
		 * Loaded namespace data. Populated during {@linkcode load}.
		 * @type APINamespace[]
		 */

		this.namespaces = [];

		/**
		 * ID lookup for loaded API definitions. Populated during {@linkcode load}.
		 * @type {Object.<string, APIDefinition>}
		 */

		this.definitions = {};
	}

	load()
	{
		if (!this.#loading)
		{
			let rawXML = fs.readFileSync(this.xmlPath + '/' + this.xmlIndexFile, { encoding: 'UTF-8' });

			let xml = APILoader.#sanitiseXMLContent(rawXML);

			let arrayPathPattern = /doxygenindex\.compound$|doxygenindex\.compound\.member$/

			let parser = new XMLParser({
				ignoreDeclaration: true,
				ignoreAttributes: false,
				textNodeName: 'textcontent',
				attributesGroupName : 'attributes',
				attributeNamePrefix : '',
				isArray: (name, jsonPath, isLeafNode, isAttribute) => {
					return (jsonPath.match(arrayPathPattern) != null);
				},
				trimValues: true
			});

			let json = parser.parse(xml).doxygenindex;

			this.json = json;

			for (let i = 0; i < json.compound.length; i++)
			{
				this.#processCompound(json.compound[i]);
			}

			this.#loaded();
		}
	}

	#processCompound(json)
	{
		switch (json.attributes.kind)
		{
			case 'file':
			case 'dir':
				return;
		}

		this.#loadDefinition(json.attributes.refid);
	}

	#loadDefinition(defFileBaseName)
	{
		let rawXML = fs.readFileSync(this.xmlPath + '/' + defFileBaseName + '.xml', { encoding: 'UTF-8' });

		let xml = APILoader.#sanitiseXMLContent(rawXML);

		let arrayPathPattern = /compounddef\.basecompoundref$|compounddef\.sectiondef$|compounddef\.sectiondef.memberdef$|compounddef\.sectiondef.memberdef\.enumvalue$|compounddef\.sectiondef.memberdef\.param$|compounddef\.listofallmembers\.member$|para$|para\.computeroutput$|para\.programlisting$|para\.programlisting\.codeline$|para\.programlisting\.codeline\.highlight$|para\.parameterlist$|para\.parameterlist\.parameteritem$/

		let parser = new XMLParser({
			ignoreDeclaration: true,
			ignoreAttributes: false,
			textNodeName: 'textcontent',
			attributesGroupName : 'attributes',
			attributeNamePrefix : '',
			stopNodes: [
				'doxygen.compounddef.sectiondef.memberdef.type',
				'doxygen.compounddef.sectiondef.memberdef.param.type'
			],
			isArray: (name, jsonPath, isLeafNode, isAttribute) => {
				return (jsonPath.match(arrayPathPattern) != null);
			},
			trimValues: true
		});

		let json = parser.parse(xml).doxygen;

		this.#processDefinition(json);
	}

	#processDefinition(json)
	{
		switch (json.compounddef.attributes.prot)
		{
			case 'private':
			case 'package':
				return;
		}

		switch (json.compounddef.attributes.kind)
		{
			case 'namespace':
				this.namespaces.push(this.#processNamespace(json.compounddef));
				break;
			case 'class':
			case 'struct':
			case 'interface':
				this.#objects.push(this.#processObject(json.compounddef, null));
				break;
			default:
				console.warn('Unhandled definition element kind "' + json.compounddef.attributes.kind + '".', json);
				break;
		}
	}

	#processNamespace(json)
	{
		let apiNamespace = new APINamespace();

		apiNamespace.qualifiedName = json.compoundname.replace(/::/g, '.');
		apiNamespace.name = apiNamespace.qualifiedName.match(/[^\.]+$/)[0];

		if (json.sectiondef)
		{
			let methods = {};

			for (let s = 0; s < json.sectiondef.length; s++)
			{
				let sectiondef = json.sectiondef[s];

				for (let m = 0; m < sectiondef.memberdef.length; m++)
				{
					let memberdef = sectiondef.memberdef[m];

					switch (memberdef.attributes.prot)
					{
						case 'private':
						case 'package':
							continue;
					}

					switch (memberdef.attributes.kind)
					{
						case 'enum':
							apiNamespace.members.push(this.#processEnum(memberdef, apiNamespace.qualifiedName));
							break;
						case 'function':
							// C# doesn't support global functions so any function declared directly in a namespace will be a delegate.

							let apiMethod = this.#processMethod(memberdef, null, apiNamespace.qualifiedName);

							let methodReference = new APIReference();

							methodReference.id = apiMethod.id;
							methodReference.qualifiedName = apiMethod.qualifiedName;
							methodReference.name = apiMethod.name;

							if (!methods[apiMethod.name])
							{
								methods[apiMethod.name] = [];
							}

							methods[apiMethod.name].push(methodReference);

							apiNamespace.members.push(apiMethod);
							break;
						default:
							console.warn('Unhandled namespace member kind "' + memberdef.attributes.kind + '".', memberdef);
							break;
					}
				}
			}

			for (let f = 0; f < apiNamespace.members.length; f++)
			{
				let member = apiNamespace.members[f];
				let method = methods[member.name];

				if (!method || method.length < 2)
				{
					continue;
				}

				for (let i = 0; i < method.length; i++)
				{
					if (method[i].id != member.id)
					{
						member.overloads.push(method[i]);
					}
				}
			}
		}

		return apiNamespace;
	}

	#processEnum(json, namespace)
	{
		let apiEnum = new APIEnum();

		apiEnum.id = json.attributes.id;
		apiEnum.qualifiedName = json.qualifiedname;
		apiEnum.name = json.name;
		apiEnum.namespace = namespace;
		apiEnum.assembly = namespace;// Data not included in xml, assume namespaces map to assemblies or figure out another way to implement.
		apiEnum.shortDescription = APILoader.#extractDescription(json.briefdescription);
		apiEnum.description = apiEnum.shortDescription + APILoader.#extractDescription(json.detaileddescription);

		for (let v = 0; v < json.enumvalue.length; v++)
		{
			let enumvalue = json.enumvalue[v];

			let apiEnumValue = new APIEnumValue();

			apiEnumValue.id = enumvalue.attributes.id;
			apiEnumValue.name = enumvalue.name;
			apiEnumValue.description = APILoader.#extractDescription(enumvalue.briefdescription) + APILoader.#extractDescription(enumvalue.detaileddescription);

			apiEnum.values.push(apiEnumValue);
		}

		return apiEnum;
	}

	#processObject(json, owner)
	{
		let apiObject = new APIObject();

		apiObject.id = json.attributes.id;
		apiObject.owner = owner;
		apiObject.definitionType = json.attributes.kind;
		apiObject.qualifiedName = APILoader.#sanitizeIdentifier(json.compoundname.replace(/::/g, '.'));
		apiObject.name = apiObject.qualifiedName.match(/[^\.]+$/)[0];
		apiObject.access = json.attributes.prot;
		apiObject.namespace = apiObject.qualifiedName.match(/.*(?=\.\w+)/)[0];// Needs to be checked against valid namespaces. Won't work if it's a nested type.
		apiObject.assembly = apiObject.namespace;// Data not included in xml, assume namespaces map to assemblies or figure out another way to implement.
		apiObject.shortDescription = APILoader.#extractDescription(json.briefdescription);
		apiObject.description = apiObject.shortDescription + APILoader.#extractDescription(json.detaileddescription);

		let objectReference = new APIReference();
		objectReference.id = apiObject.id;
		objectReference.qualifiedName = apiObject.qualifiedName;
		objectReference.name = apiObject.name;

		if (json.templateparamlist && json.templateparamlist.param)
		{
			let parameterdescriptions = APILoader.#extractParameterDescriptions(json.detaileddescription);

			for (let t = 0; t < json.templateparamlist.param.length; t++)
			{
				let apiTemplateType = new APITemplateType();

				// NOTE Type constraints don't appear to be provided in the XML.

				let identifier = json.templateparamlist.param[t].type;

				apiTemplateType.identifier = identifier;
				apiTemplateType.description = parameterdescriptions.templateparameters[identifier] || null;

				apiObject.types.push(apiTemplateType);
			}
		}

		if (json.basecompoundref)
		{
			for (let b = 0; b < json.basecompoundref.length; b++)
			{
				let baseref = json.basecompoundref[b];

				let baseReference = new APIReference();

				baseReference.id = baseref.attributes.refid || null;
				baseReference.qualifiedName = APILoader.#sanitizeIdentifier(baseref.textcontent);
				baseReference.name = baseReference.qualifiedName.match(/[^\.]+$/)[0];

				if ((baseReference.id && baseReference.id.match(/^interface_/)) || baseReference.name.match(/I[A-Z]\w+/))
				{
					// Interfaces that are defined in the project will have a reference that begins with 'interface_', however the xml data
					// doesn't include data for interfaces that are defined externally. When this is the case we'll assume the base is an
					// interface if it begins with capital I and is followed by a word.

					apiObject.implements.push(baseReference);
				}
				else
				{
					apiObject.inherits.push(baseReference);
				}
			}
		}

		if (json.sectiondef)
		{
			let methods = {};

			for (let s = 0; s < json.sectiondef.length; s++)
			{
				let sectiondef = json.sectiondef[s];

				for (let m = 0; m < sectiondef.memberdef.length; m++)
				{
					let memberdef = sectiondef.memberdef[m];

					switch (memberdef.attributes.prot)
					{
						case 'private':
						case 'package':
							continue;
					}

					switch (memberdef.attributes.kind)
					{
						case 'variable':
							apiObject.members.push(this.#processField(memberdef, objectReference));
							break;
						case 'property':
							apiObject.members.push(this.#processProperty(memberdef, objectReference));
							break;
						case 'function':
							let apiMethod = this.#processMethod(memberdef, objectReference, null);

							let methodReference = new APIReference();

							methodReference.id = apiMethod.id;
							methodReference.qualifiedName = apiMethod.qualifiedName;
							methodReference.name = apiMethod.name;

							if (!methods[apiMethod.name])
							{
								methods[apiMethod.name] = [];
							}

							methods[apiMethod.name].push(methodReference);

							apiObject.members.push(apiMethod);
							break;
						case 'event':
							apiObject.members.push(this.#processEvent(memberdef, objectReference));
							break;
						default:
							console.warn('Unhandled object member kind "' + memberdef.attributes.kind + '".', memberdef);
							break;
					}
				}
			}

			for (let f = 0; f < apiObject.members.length; f++)
			{
				let member = apiObject.members[f];
				let method = methods[member.name];

				if (!method || method.length < 2)
				{
					continue;
				}

				for (let i = 0; i < method.length; i++)
				{
					if (method[i].id != member.id)
					{
						member.overloads.push(method[i]);
					}
				}
			}
		}

		apiObject.members.sort((memberA, memberB) => {
			return memberA.name.localeCompare(memberB.name);
		});

		return apiObject;
	}

	#processField(json, owner)
	{
		let apiField = new APIField();

		apiField.id = json.attributes.id;
		apiField.owner = owner;
		apiField.qualifiedName = APILoader.#sanitizeIdentifier(json.qualifiedname);
		apiField.name = APILoader.#sanitizeIdentifier(json.name);
		apiField.type = APILoader.#typeToHTML(json.type);
		apiField.access = json.attributes.prot;
		apiField.static = (json.attributes.static == 'yes');
		apiField.shortDescription = APILoader.#extractDescription(json.briefdescription);
		apiField.description = apiField.shortDescription + APILoader.#extractDescription(json.detaileddescription);

		return apiField;
	}

	#processProperty(json, owner)
	{
		let apiProperty = new APIProperty();

		apiProperty.id = json.attributes.id;
		apiProperty.owner = owner;
		apiProperty.qualifiedName = APILoader.#sanitizeIdentifier(json.qualifiedname);
		apiProperty.name = APILoader.#sanitizeIdentifier(json.name);
		apiProperty.type = APILoader.#typeToHTML(json.type);
		apiProperty.getAccess = (json.attributes.gettable == 'yes') ? json.attributes.prot : (json.attributes.protectedgettable == 'yes') ? 'protected' : null;
		apiProperty.setAccess = (json.attributes.settable == 'yes') ? json.attributes.prot : (json.attributes.protectedsettable == 'yes') ? 'protected' : null;
		apiProperty.access = apiProperty.getAccess;
		apiProperty.static = (json.attributes.static == 'yes');
		apiProperty.shortDescription = APILoader.#extractDescription(json.briefdescription);
		apiProperty.description = apiProperty.shortDescription + APILoader.#extractDescription(json.detaileddescription);

		return apiProperty;
	}

	#processMethod(json, owner, namespace)
	{
		let apiMethod = new APIMethod();

		apiMethod.id = json.attributes.id;
		apiMethod.owner = owner;
		apiMethod.definitionType = owner ? 'method' : 'delegate';
		apiMethod.qualifiedName = APILoader.#sanitizeIdentifier(json.qualifiedname);
		apiMethod.name = APILoader.#sanitizeIdentifier(json.name);
		apiMethod.type = APILoader.#typeToHTML(json.type);// Return type or "void".
		apiMethod.access = json.attributes.prot;
		apiMethod.static = (json.attributes.static == 'yes');
		apiMethod.delegate = !owner;
		apiMethod.namespace = namespace;
		apiMethod.assembly = namespace;
		apiMethod.shortDescription = APILoader.#extractDescription(json.briefdescription);
		apiMethod.description = apiMethod.shortDescription + APILoader.#extractDescription(json.detaileddescription);

		if (json.param)
		{
			for (let p = 0; p < json.param.length; p++)
			{
				let param = json.param[p];

				let apiParameter = new APIParameter();

				apiParameter.name = param.declname;
				apiParameter.type = APILoader.#typeToHTML(param.type);

				// TODO Handle default value?

				apiMethod.params.push(apiParameter);
			}
		}

		let parameterdescriptions = APILoader.#extractParameterDescriptions(json.detaileddescription);

		for (let identifier in parameterdescriptions.templateparameters)
		{
			let apiTemplateType = new APITemplateType();

			// NOTE Type constraints don't appear to be provided in the XML.

			apiTemplateType.identifier = identifier;
			apiTemplateType.description = parameterdescriptions.templateparameters[identifier];

			apiMethod.types.push(apiTemplateType);
		}

		for (let i = 0; i < apiMethod.params.length; i++)
		{
			let param = apiMethod.params[i];

			let description = parameterdescriptions.parameters[param.name];

			if (description)
			{
				param.description = description;
			}
		}

		apiMethod.returnsDescription = APILoader.#extractReturnsDescription(json.detaileddescription);

		return apiMethod;
	}

	#processEvent(json, owner)
	{
		let apiEvent = new APIEvent();

		apiEvent.id = json.attributes.id;
		apiEvent.owner = owner;
		apiEvent.qualifiedName = APILoader.#sanitizeIdentifier(json.qualifiedname);
		apiEvent.name = APILoader.#sanitizeIdentifier(json.name);
		apiEvent.type = APILoader.#typeToHTML(json.type);
		apiEvent.access = json.attributes.prot;
		apiEvent.static = (json.attributes.static == 'yes');
		apiEvent.shortDescription = APILoader.#extractDescription(json.briefdescription);
		apiEvent.description = apiEvent.shortDescription + APILoader.#extractDescription(json.detaileddescription);

		return apiEvent;
	}

	#loaded()
	{
		let namespaces = this.namespaces;

		namespaces.sort((namespaceA, namespaceB) => {
			return namespaceA.qualifiedName.localeCompare(namespaceB.qualifiedName);
		});

		let objects = this.#objects;

		for (let n = namespaces.length - 1; n >= 0; n--)
		{
			let namespace = namespaces[n];
			let namespacePrefix = namespace.qualifiedName + '.';

			for (let o = 0; o < objects.length; )
			{
				let object = objects[o];

				if (object.qualifiedName.indexOf(namespacePrefix) == 0)
				{
					object.name = object.qualifiedName.substr(namespacePrefix.length);
					object.namespace = namespace.qualifiedName;
					object.assembly = namespace.qualifiedName;

					// TODO Iterate over object members and assign namespace?

					namespace.members.push(object);
					objects.splice(o, 1);

					continue;
				}

				o++;
			}

			// namespace.members.sort((memberA, memberB) => {
			// 	return memberA.name.localeCompare(memberB.name);
			// });

			APINamespace.sortMembers(namespace);
		}

		let definitions = this.definitions;

		for (let n = 0; n < namespaces.length; )
		{
			let namespace = namespaces[n];
			let hasMembers = !!namespace.members.length;

			if (!hasMembers)
			{
				for (let i = n + 1; i < namespaces.length; i++)
				{
					let nextNamespace = namespaces[i];

					if (nextNamespace.qualifiedName.indexOf(`${namespace.qualifiedName}.`) != 0)
					{
						break;
					}

					if (nextNamespace.members.length)
					{
						hasMembers = true;
						break;
					}
				}
			}

			if (!hasMembers)
			{
				namespaces.splice(n, 1);
				continue;
			}

			// Reiterate over each member and assign definition and ensure any base or interface references have the correct name.

			for (let m = 0; m < namespace.members.length; m++)
			{
				let member = namespace.members[m];

				member.namespace = namespace.qualifiedName;
				member.assembly = namespace.qualifiedName;

				if (member.id)
				{
					definitions[member.id] = member;
				}

				if (member.members)
				{
					for (let b = 0; b < member.inherits.length; b++)
					{
						let baseRef = member.inherits[b];
						let refObject = definitions[baseRef.id];

						if (refObject)
						{
							baseRef.name = baseRef.qualifiedName.substr(baseRef.qualifiedName.lastIndexOf(refObject.name));
						}
					}

					for (let i = 0; i < member.implements.length; i++)
					{
						let interfaceRef = member.implements[i];
						let refObject = definitions[interfaceRef.id];

						if (refObject)
						{
							interfaceRef.name = interfaceRef.qualifiedName.substr(interfaceRef.qualifiedName.lastIndexOf(refObject.name));
						}
					}

					for (let c = 0; c < member.members.length; c++)
					{
						member.members[c].namespace = namespace.qualifiedName;
						member.members[c].assembly = namespace.qualifiedName;

						if (member.members[c].id)
						{
							definitions[member.members[c].id] = member.members[c];
						}
					}
				}
			}

			n++;
		}

		let prevNamespace = namespaces[0];

		for (let n = 1; n < namespaces.length; )
		{
			let currNamespace = namespaces[n];

			if (currNamespace.qualifiedName.indexOf(`${prevNamespace.qualifiedName}.`) == 0)
			{
				let nestedNamespaceName = currNamespace.qualifiedName.substr(prevNamespace.qualifiedName.length + 1);
				let nestedNamespaceNames = nestedNamespaceName.split('.');

				for (let i = 0; i < nestedNamespaceNames.length - 1; i++)
				{
					let nestedNamespace = new APINamespace();

					nestedNamespace.qualifiedName = prevNamespace.qualifiedName + '.' + nestedNamespaceNames[i];
					nestedNamespace.name = nestedNamespaceNames[i];

					prevNamespace.members.push(nestedNamespace);

					APINamespace.sortMembers(prevNamespace);

					prevNamespace = nestedNamespace;
				}

				prevNamespace.members.push(currNamespace);

				APINamespace.sortMembers(prevNamespace);

				namespaces.splice(n, 1);
			}
			else
			{
				n++;
			}

			prevNamespace = currNamespace;
		}

		this.#loading = false;
		this.dispatchEvent(new Event('loaded'));
	}

	static #sanitiseXMLContent(xml)
	{
		// Files are inconsistent with tag naming...

		return xml.replace(/\r/g, '\n').replace(/<(\/)detaildescription>/g, '<$1detaileddescription>').replace(/\s*<programlisting>/g, '$blockcode<programlisting>').replace(/<computeroutput>/g, '$inlinecode<computeroutput>').replace(/<sp\s*\/>/g, '&nbsp;');
	}

	/**
	 * Strips type parameters and indexer names from an identifier.
	 * @param {String} identifier - The identifier to sanitize.
	 * @returns {String} A sanitized identifier.
	 */

	static #sanitizeIdentifier(identifier)
	{
		return identifier.replace(/\s*<.*>\s*/g, '').replace(/\s*\[\s*(.+)\s+.+]/g, '[$1]');
	}

	static #typeToHTML(type)
	{
		return type.replace(/<ref\s+refid="(\w+)"[^>]*>(\w+)<\/ref>/g, '<a href="$1">$2</a>');
	}

	static #extractDescription(json)
	{
		if (json && json.para)
		{
			let description = '';

			for (let i = 0; i < json.para.length; i++)
			{
				let para = json.para[i];

				if (typeof para === 'string')
				{
					description += '<p>' + para.split('$blockcode').join('</p><p class="code">$blockcode') + '</p>';
					continue;
				}

				if (typeof para !== 'object')
				{
					continue;
				}

				if (para.textcontent)
				{
					description += '<p>' + para.textcontent.split('$blockcode').join('</p><p class="code">$blockcode') + '</p>';
				}

				if (para.computeroutput)
				{
					for (let c = 0; c < para.computeroutput.length; c++)
					{
						let inlinecode = '<code>' + para.computeroutput[c] + '</code>';

						description = description.replace(/\$inlinecode/, inlinecode);
					}
				}

				if (para.programlisting)
				{
					for (let p = 0; p < para.programlisting.length; p++)
					{
						let programlisting = para.programlisting[p];

						let htmlLines = [];

						for (let l = 0; l < programlisting.codeline.length; l++)
						{
							let codeline = programlisting.codeline[l];

							let htmlLine = '';

							for (let h = 0; h < codeline.highlight.length; h++)
							{
								let highlight = codeline.highlight[h];

								// Ignore empty strings.

								if (highlight.textcontent)
								{
									htmlLine += '<span class="' + highlight.attributes.class + '">' + highlight.textcontent + '</span>';
								}
							}

							htmlLines.push(htmlLine);
						}

						let blockcode = htmlLines.join('<br/>');

						description = description.replace(/\$blockcode/, blockcode);
					}
				}
			}

			return description;
		}

		return '';
	}

	static #extractParameterDescriptions(json)
	{
		let descriptions = {
			templateparameters: {},
			parameters: {}
		};

		// Additional parameter lists and returns data can be present if a preceeding method has been commented out in the source and
		// the doc comments haven't been removed. When this happens we need to ignore the preceeding parameter lists and returns data
		// and only use the last entries.

		if (json && json.para)
		{
			for (let p = 0; p < json.para.length; p++)
			{
				let para = json.para[p];

				if (!para.parameterlist)
				{
					continue;
				}

				for (let l = 0; l < para.parameterlist.length; l++)
				{
					let parameterlist = para.parameterlist[l];

					let parameters = null;

					switch (parameterlist.attributes.kind)
					{
						case 'templateparam':
							parameters = descriptions.templateparameters;
							break;
						case 'param':
							parameters = descriptions.parameters;
							break;
						default:
							console.warn('Unhandled parameter list kind "' + parameterlist.attributes.kind + '".');
							continue;
					}

					for (let i = 0; i < parameterlist.parameteritem.length; i++)
					{
						let parameteritem = parameterlist.parameteritem[i];

						parameters[parameteritem.parameternamelist.parametername] = APILoader.#extractDescription(parameteritem.parameterdescription);
					}
				}
			}
		}

		return descriptions;
	}

	static #extractReturnsDescription(json)
	{
		let description = '';

		// Additional parameter lists and returns data can be present if a preceeding method has been commented out in the source and
		// the doc comments haven't been removed. When this happens we need to ignore the preceeding parameter lists and returns data
		// and only use the last entries.

		if (json && json.para)
		{
			for (let p = 0; p < json.para.length; p++)
			{
				let para = json.para[p];

				if (typeof para !== 'object' || !para.simplesect)
				{
					continue;
				}

				if (para.simplesect.attributes.kind !== 'return')
				{
					console.warn('Unknown simplesect kind "' + para.simplesect.attributes.kind + '" found');
					continue;
				}

				description = APILoader.#extractDescription(para.simplesect);
			}
		}

		return description;
	}
}