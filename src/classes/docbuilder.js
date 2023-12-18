import DocBuilderTemplates from './docbuildertemplates.js';
import DocBuilderVars from './docbuildervars.js';
import APINamespace from './apinamespace.js';
import APIEnum from './apienum.js';
import APIEnumValue from './apienumvalue.js';
import APIObject from './apiobject.js';
import APIField from './apifield.js';
import APIProperty from './apiproperty.js';
import APIMethod from './apimethod.js';
import APIParameter from './apiparameter.js';
import APIEvent from './apievent.js';
import fs from 'fs';

/**
 * An API definition.
 * @typedef {APINamespace|APIObject|APIField|APIProperty|APIMethod|APIEvent|APIEnum|APIEnumValue|APIParameter} APIDefinition
 */

/**
 * Search information for a documented object.
 * @typedef {Object} SearchDef
 * @property {String} name - Name of the documented object.
 * @property {String} description - Description of the documented object.
 * @property {String} url - Page URL of the documented object.
 */

/**
 * Generates API documentation.
 */

export default class DocBuilder extends EventTarget
{
	/**
	 * Object containing search information for all documented objects in the API.
	 * @type {Object.<string, SearchDef[]]>}
	 */

	#searchData = null;

	/**
	 * Initialize a new {@linkcode DocBuilder}.
	 * @param {APINamespace[]} namespaces - {@link APINamespace APINamespaces} containing the members to build the documentation for.
	 * @param {Object.<String, APIDefinition>} definitions - ID lookup for all API definitions to build documentation for.
	 * @param {DocBuilderTemplates} templates - Template HTML markup to use when building documentation pages.
	 * @param {String} outputPath - Path to the local root of the documentation site where pages will be created.
	 * @param {String} outputFileExtension - File extension for built pages.
	 * @param {String} urlRootPath - URL path to the documentation site root on the server/hosting environment.
	 * @param {String} apiSubPath - Path relative from {@linkcode outputPath}/{@linkcode urlRootPath} where documentation pages will be created/located.
	 * @param {String} searchdataSubPath - Path relative from {@linkcode outputPath}/{@linkcode urlRootPath} where the search data file (searchdata.js) will be created/located.
	 */

	constructor(namespaces, definitions, templates, outputPath, outputFileExtension, urlRootPath, apiSubPath, searchdataSubPath)
	{
		super();

		/**
		 * {@link APINamespace APINamespaces} containing the members to build the documentation for.
		 * @type APINamespace[]
		 * */

		this.namespaces = namespaces || null;

		/**
		 * ID lookup for all API definitions to build documentation for.
		 * @type {Object.<String, APIDefinition>}
		 */

		this.definitions = definitions || null;

		/**
		 * Template HTML markup to use when building documentation pages.
		 * @type DocBuilderTemplates
		 */

		this.templates = templates || null;

		/**
		 * Path to the local root of the documentation site where pages will be created.
		 * @type String
		 */

		this.outputPath = outputPath || null;

		/**
		 * File extension for built pages. Defaults to `"html"`.
		 * @type String
		 */

		this.outputFileExtension = outputFileExtension || 'html';

		/**
		 * URL path to the documentation site root on the server/hosting environment.
		 * @type String
		 */

		this.urlRootPath = urlRootPath || null;

		/**
		 * Path relative from {@linkcode outputPath}/{@linkcode urlRootPath} where documentation pages will be created/located.
		 * Defaults to `"API"`.
		 * @type String
		 */

		this.apiSubPath = apiSubPath || 'API';

		/**
		 * Path relative from {@linkcode outputPath}/{@linkcode urlRootPath} where the search data file (searchdata.js) will be created/located.
		 * Defaults to `"scripts"`.
		 * @type String
		 */

		this.searchdataSubPath = searchdataSubPath || 'scripts';

		/**
		 * Optional padding for parameters between brackets.
		 * @type String
		 */

		this.parameterPadding = null;
	}

	/**
	 * Build the documentation website with the DocBuilder's current properties.
	 * Pages for documented types and members will be created at `outputPath/apiSubPath`.
	 * A file named `searchdata.js` will be created at `outputPath/searchdataSubPath`.
	 */

	buildDocs()
	{
		if (!this.namespaces)
		{
			throw new Error('namespaces is null or undefined.');
		}

		if (!this.definitions)
		{
			throw new Error('definitions is null or undefined.');
		}

		if (!this.templates)
		{
			throw new Error('templates is null or undefined.');
		}

		if (!this.outputPath)
		{
			throw new Error('outputPath is null, undefined or empty.');
		}

		let trailingSlashes = /\/+$/;

		this.outputPath = this.outputPath.replace(trailingSlashes, '');
		this.urlRootPath = this.urlRootPath.replace(trailingSlashes, '');
		this.apiSubPath = this.apiSubPath.replace(trailingSlashes, '');
		this.searchdataSubPath = this.searchdataSubPath.replace(trailingSlashes, '');

		this.#searchData = {};

		this.#buildIndexPage();
		this.#buildSearchPage();
		this.#buildAPIPages();

		let searchData = this.#searchData;
		let searchDataStrings = [];

		for (var searchValue in searchData)
		{
			let searchDefs = searchData[searchValue];
			let searchDefStrings = [];

			for (let i = 0; i < searchDefs.length; i++)
			{
				searchDefStrings.push(`{name: "${searchDefs[i].name}", description: "${searchDefs[i].description.replace(/\"/g, '\\\"')}", url: "${searchDefs[i].url}"}`);
			}

			searchDataStrings.push(searchValue + ': [\n\t\t' + searchDefStrings.join(',\n\t\t') + '\n\t]');
		}

		let searchFilePath = this.#getOutputPath(this.searchdataSubPath);
		let searchFileText = `export default {\n\t${searchDataStrings.join(',\n\t')}\n}`;

		fs.mkdirSync(searchFilePath, {recursive: true});
		fs.writeFileSync(`${searchFilePath}/searchdata.js`, searchFileText);

		this.dispatchEvent(new Event('complete'));
	}

	/**
	 * Build the index page for the documentation site.
	 */

	#buildIndexPage()
	{
		let content = this.templates.index;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, null));

		fs.writeFileSync(this.#getOutputPath(`index.${this.outputFileExtension}`), content);
	}

	/**
	 * Build the search page for the documentation site.
	 */

	#buildSearchPage()
	{
		let content = this.templates.search;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, null));

		fs.writeFileSync(this.#getOutputPath(`search.${this.outputFileExtension}`), content);
	}

	#buildAPIPages()
	{
		for (let n = 0; n < this.namespaces.length; n++)
		{
			this.#buildNamespacePages(this.namespaces[n]);
		}
	}

	/**
	 * Build pages for the members of a namespace.
	 * @param {APINamespace} namespace - The namespace to build pages for.
	 */

	#buildNamespacePages(namespace)
	{
		for (let m = 0; m < namespace.members.length; m++)
		{
			let member = namespace.members[m];

			switch (member.definitionType)
			{
				case 'class':
				case 'struct':
				case 'interface':
					this.#buildObjectPage(member);
					break;
				case 'enum':
					this.#buildEnumPage(member);
					break;
				case 'delegate':
					this.#buildMethodPage(member);
					break;
				case 'namespace':
					this.#buildNamespacePages(member);
					break;
				default:
					console.warn('Unhandled namespace member definition type "' + member.definitionType + '".');
					break;
			}
		}
	}

	/**
	 * Build the documentation pages for a class, struct or interface, and its members.
	 * @param {APIObject} definition - The definition of the class, struct or interface to build the documentation pages for.
	 */

	#buildObjectPage(definition)
	{
		this.#addSearchData(definition);

		let templates = this.templates;

		let fieldSections = {
			all: { pageVar: DocBuilderVars.FIELD_SECTION, template: templates.fieldSection, access: '', memberTemplate: templates.field, members: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_FIELD_SECTION, template: templates.instanceFieldSection, access: '', memberTemplate: templates.instanceField, members: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_FIELD_SECTION, template: templates.publicFieldSection, access: 'public', memberTemplate: templates.publicField, members: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_FIELD_SECTION, template: templates.protectedFieldSection, access: 'protected', memberTemplate: templates.protectedField, members: [] },
			static: { pageVar: DocBuilderVars.STATIC_FIELD_SECTION, template: templates.staticFieldSection, access: '', memberTemplate: templates.staticField, members: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, template: templates.publicStaticFieldSection, access: 'public', memberTemplate: templates.publicStaticField, members: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, template: templates.protectedStaticFieldSection, access: 'protected', memberTemplate: templates.protectedStaticField, members: [] }
		};

		let propertySections = {
			all: { pageVar: DocBuilderVars.PROPERTY_SECTION, template: templates.propertySection, access: '', memberTemplate: templates.property, members: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_PROPERTY_SECTION, template: templates.instancePropertySection, access: '', memberTemplate: templates.instanceProperty, members: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_PROPERTY_SECTION, template: templates.publicPropertySection, access: 'public', memberTemplate: templates.publicProperty, members: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_PROPERTY_SECTION, template: templates.protectedPropertySection, access: 'protected', memberTemplate: templates.protectedProperty, members: [] },
			static: { pageVar: DocBuilderVars.STATIC_PROPERTY_SECTION, template: templates.staticPropertySection, access: '', memberTemplate: templates.staticProperty, members: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, template: templates.publicStaticPropertySection, access: 'public', memberTemplate: templates.publicStaticProperty, members: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, template: templates.protectedStaticPropertySection, access: 'protected', memberTemplate: templates.protectedStaticProperty, members: [] }
		};

		let methodSections = {
			all: { pageVar: DocBuilderVars.METHOD_SECTION, template: templates.methodSection, access: '', memberTemplate: templates.method, members: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_METHOD_SECTION, template: templates.instanceMethodSection, access: '', memberTemplate: templates.instanceMethod, members: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_METHOD_SECTION, template: templates.publicMethodSection, access: 'public', memberTemplate: templates.publicMethod, members: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_METHOD_SECTION, template: templates.protectedMethodSection, access: 'protected', memberTemplate: templates.protectedMethod, members: [] },
			static: { pageVar: DocBuilderVars.STATIC_METHOD_SECTION, template: templates.staticMethodSection, access: '', memberTemplate: templates.staticMethod, members: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, template: templates.publicStaticMethodSection, access: 'public', memberTemplate: templates.publicStaticMethod, members: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, template: templates.protectedStaticMethodSection, access: 'protected', memberTemplate: templates.protectedStaticMethod, members: [] }
		};

		let eventSections = {
			all: { pageVar: DocBuilderVars.EVENT_SECTION, template: templates.eventSection, access: '', memberTemplate: templates.event, members: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_EVENT_SECTION, template: templates.instanceEventSection, access: '', memberTemplate: templates.instanceEvent, members: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_EVENT_SECTION, template: templates.publicEventSection, access: 'public', memberTemplate: templates.publicEvent, members: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_EVENT_SECTION, template: templates.protectedEventSection, access: 'protected', memberTemplate: templates.protectedEvent, members: [] },
			static: { pageVar: DocBuilderVars.STATIC_EVENT_SECTION, template: templates.staticEventSection, access: '', memberTemplate: templates.staticEvent, members: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, template: templates.publicStaticEventSection, access: 'public', memberTemplate: templates.publicStaticEvent, members: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, template: templates.protectedStaticEventSection, access: 'protected', memberTemplate: templates.protectedStaticEvent, members: [] }
		};

		let memberDefinitionTypes = [
			{ sections: fieldSections, membersVar: DocBuilderVars.FIELDS, constructMember: this.#constructField.bind(this) },
			{ sections: propertySections, membersVar: DocBuilderVars.PROPERTIES, constructMember: this.#constructProperty.bind(this) },
			{ sections: methodSections, membersVar: DocBuilderVars.METHODS, constructMember: this.#constructMethod.bind(this) },
			{ sections: eventSections, membersVar: DocBuilderVars.EVENTS, constructMember: this.#constructEvent.bind(this) }
		];

		for (let m = 0; m < definition.members.length; m++)
		{
			let member = definition.members[m];

			let memberSections = null;

			switch (member.definitionType)
			{
				case 'field':
					memberSections = fieldSections;
					this.#buildFieldPage(member);
					break;
				case 'property':
					memberSections = propertySections;
					this.#buildPropertyPage(member);
					break;
				case 'method':
					memberSections = methodSections;
					this.#buildMethodPage(member);
					break;
				case 'event':
					memberSections = eventSections;
					this.#buildEventPage(member);
					break;
				default:
					throw new Error('Unhandled namespace member definition type "' + member.definitionType + '".');
			}

			memberSections.all.members.push(member);

			if (member.static)
			{
				memberSections.static.members.push(member);

				if (member.access == 'public')
				{
					memberSections.publicStatic.members.push(member);
				}
				else if (member.access == 'protected')
				{
					memberSections.protectedStatic.members.push(member);
				}
				else
				{
					throw new Error('Unhandled member protection level "' + member.access + '".');
				}
			}
			else
			{
				memberSections.instance.members.push(member);

				if (member.access == 'public')
				{
					memberSections.public.members.push(member);
				}
				else if (member.access == 'protected')
				{
					memberSections.protected.members.push(member);
				}
				else
				{
					throw new Error('Unhandled member protection level "' + member.access + '".');
				}
			}
		}

		let content = templates.page;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_FULL_NAME), this.#constructFullName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_QUALIFIED_NAME), this.#constructQualifiedName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructObjectDeclaration(definition));

		if (definition.inherits.length)
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS), this.#constructInherits(definition));
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		}

		if (definition.implements.length)
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS), this.#constructImplements(definition));
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_OWNER), this.#constructOwner(definition));

		if (definition.description)
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		// NOTE Type parameter constraints aren't supplied by Doxygen.

		if (definition.types && definition.types.length)
		{
			let typeParamsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.TYPE_PARAMETER_SECTION, content);

			let typeParamsSection = templates.typeParameterSection.replace(/\n/g, `\n${typeParamsLeadingWhitespace}`);
			let typeParamsContents = [];

			typeParamsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.TYPE_PARAMETERS, typeParamsSection);

			for (let i = 0; i < definition.types.length; i++)
			{
				let typeParam = definition.types[i];
				let typeParamContent = templates.typeParameter.replace(/\n/g, `\n${typeParamsLeadingWhitespace}`);

				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_NAME), '<span class="member-name">' + typeParam.identifier + '</span>');
				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_DESCRIPTION), typeParam.description);

				typeParamsContents.push(typeParamContent);
			}

			typeParamsSection = typeParamsSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETERS), typeParamsContents.join(`\n${typeParamsLeadingWhitespace}`) );

			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION), typeParamsSection);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		}

		// The following loop handles all field, property, method and event section properties on the page.

		for (let t = 0; t < memberDefinitionTypes.length; t++)
		{
			// field, property, method or event.
			// { sections: {String, Section}, membersVar: String, constructMember: Function }
			let definitionType = memberDefinitionTypes[t];

			for (let sectionName in definitionType.sections)
			{
				// all, instance, public, protected, static, publicStatic or protectedStatic.
				// { pageVar: String, template: String, access: String, memberTemplate: String, members: APIDefinition[] }
				let section = definitionType.sections[sectionName];

				if (section.members.length < 1)
				{
					content = content.replace(DocBuilderVars.regExp(section.pageVar, true), '');
					continue;
				}

				let sectionRegExp = DocBuilderVars.regExp(section.pageVar);

				if (!content.match(sectionRegExp))
				{
					continue;
				}

				let sectionLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(section.pageVar, content);

				let sectionContent = this.#constructMemberSection(section.template, sectionLeadingWhitespace, section.access, definitionType.membersVar, section.members, definitionType.constructMember, section.memberTemplate);

				content = content.replace(sectionRegExp, sectionContent);
			}
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.#getAPIFileOutputPathName(definition), content);
	}

	#buildFieldPage(definition)
	{
		this.#addSearchData(definition);

		// TODO Ensure Type is linked if defined in package.

		let templates = this.templates;

		let content = templates.page;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_FULL_NAME), this.#constructFullName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_QUALIFIED_NAME), this.#constructQualifiedName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructFieldDeclaration(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_OWNER), this.#constructOwner(definition));

		if (definition.description)
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');

		let typeSection = templates.typeSection;
		typeSection = typeSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE), this.#replaceIDLinks(definition.type));

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION), typeSection);

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.#getAPIFileOutputPathName(definition), content);
	}

	#buildPropertyPage(definition)
	{
		this.#addSearchData(definition);

		let templates = this.templates;

		let content = templates.page;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_FULL_NAME), this.#constructFullName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_QUALIFIED_NAME), this.#constructQualifiedName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructPropertyDeclaration(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_OWNER), this.#constructOwner(definition));

		if (definition.description)
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');

		let typeSection = templates.typeSection;
		typeSection = typeSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE), this.#replaceIDLinks(definition.type));

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION), typeSection);

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.#getAPIFileOutputPathName(definition), content);
	}

	#buildMethodPage(definition)
	{
		this.#addSearchData(definition);

		let templates = this.templates;

		let content = templates.page;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_FULL_NAME), this.#constructFullName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_QUALIFIED_NAME), this.#constructQualifiedName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructMethodDeclaration(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_OWNER), this.#constructOwner(definition));

		if (definition.description)
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		// NOTE Type parameter constraints aren't supplied by Doxygen.

		if (definition.types && definition.types.length)
		{
			let typeParamsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.TYPE_PARAMETER_SECTION, content);

			let typeParamsSection = templates.typeParameterSection.replace(/\n/g, `\n${typeParamsLeadingWhitespace}`);
			let typeParamsContents = [];

			typeParamsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.TYPE_PARAMETERS, typeParamsSection);

			for (let i = 0; i < definition.types.length; i++)
			{
				let typeParam = definition.types[i];
				let typeParamContent = templates.typeParameter.replace(/\n/g, `\n${typeParamsLeadingWhitespace}`);

				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_NAME), '<span class="member-name">' + typeParam.identifier + '</span>');
				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_DESCRIPTION), typeParam.description);

				typeParamsContents.push(typeParamContent);
			}

			typeParamsSection = typeParamsSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETERS), typeParamsContents.join(`\n${typeParamsLeadingWhitespace}`) );

			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION), typeParamsSection);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');

		if (definition.params && definition.params.length)
		{
			let paramsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.PARAMETER_SECTION, content);

			let paramsSection = templates.parameterSection.replace(/\n/g, `\n${paramsLeadingWhitespace}`);
			let paramsContents = [];

			paramsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.PARAMETERS, paramsSection);

			for (let i = 0; i < definition.params.length; i++)
			{
				let param = definition.params[i];
				let paramContent = templates.parameter.replace(/\n/g, `\n${paramsLeadingWhitespace}`);

				paramContent = paramContent.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_TYPE), param.type);
				paramContent = paramContent.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_NAME), '<span class="member-name">' + param.name + '</span>');

				if (param.description)
				{
					paramContent = paramContent.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_DESCRIPTION), param.description);
				}
				else
				{
					paramContent = paramContent.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_DESCRIPTION, true), '');
				}

				paramsContents.push(paramContent);
			}

			paramsSection = paramsSection.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETERS), paramsContents.join(`\n${paramsLeadingWhitespace}`) );

			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION), paramsSection);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		}

		if (definition.type && definition.type.indexOf('void') < 0)
		{
			let returnLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.RETURN_SECTION, content);

			let returnSection = templates.returnSection.replace(/\n/g, `\n${returnLeadingWhitespace}`);

			returnSection = returnSection.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_TYPE), this.#replaceIDLinks(definition.type));
			returnSection = returnSection.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_DESCRIPTION), definition.returnsDescription);

			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION), returnSection);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		}

		if (definition.overloads && definition.overloads.length)
		{
			let overloadsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.OVERLOAD_SECTION, content);

			let overloadsSection = templates.overloadSection.replace(/\n/g, `\n${overloadsLeadingWhitespace}`);
			let overloadsContents = [];

			overloadsLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.METHODS, overloadsSection);

			for (let i = 0; i < definition.overloads.length; i++)
			{
				let method = this.definitions[definition.overloads[i].id];
				let methodContent = this.#constructMethod(templates.method, method, overloadsLeadingWhitespace);

				overloadsContents.push(methodContent);
			}

			overloadsSection = overloadsSection.replace(DocBuilderVars.regExp(DocBuilderVars.METHODS), overloadsContents.join(`\n${overloadsLeadingWhitespace}`));

			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION), overloadsSection);
		}
		else
		{
			content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.#getAPIFileOutputPathName(definition), content);
	}

	#buildEventPage(definition)
	{
		this.#addSearchData(definition);

		let templates = this.templates;

		// TODO Fix leading whitespace.

		let content = templates.page;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_FULL_NAME), this.#constructFullName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_QUALIFIED_NAME), this.#constructQualifiedName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructEventDeclaration(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_OWNER), this.#constructOwner(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.#getAPIFileOutputPathName(definition), content);
	}

	#buildEnumPage(definition)
	{
		this.#addSearchData(definition);

		let templates = this.templates;

		let content = templates.page;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), this.urlRootPath);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), this.#constructNav(content, definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_FULL_NAME), this.#constructFullName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_QUALIFIED_NAME), this.#constructQualifiedName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructEnumDeclaration(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_OWNER), this.#constructOwner(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');

		let valuesLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.VALUE_SECTION, content);

		let valuesSection = templates.valueSection.replace(/\n/g, `\n${valuesLeadingWhitespace}`);
		let valuesContents = [];

		valuesLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.VALUES, valuesSection);

		for (let i = 0; i < definition.values.length; i++)
		{
			let value = definition.values[i];
			let valueContent = templates.value.replace(/\n/g, `\n${valuesLeadingWhitespace}`);

			valueContent = valueContent.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_NAME), '<span class="member-name">' + value.name + '</span>');
			valueContent = valueContent.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_DESCRIPTION), value.description);

			valuesContents.push(valueContent);
		}

		valuesSection = valuesSection.replace(DocBuilderVars.regExp(DocBuilderVars.VALUES), valuesContents.join(`\n${valuesLeadingWhitespace}`));

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION), valuesSection);

		fs.writeFileSync(this.#getAPIFileOutputPathName(definition), content);
	}

	#constructNav(pageTemplate, selectedMember)
	{
		let leadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.NAV_SECTION, pageTemplate);

		let namespaceContents = [];

		for (let n = 0; n < this.namespaces.length; n++)
		{
			namespaceContents.push(this.#constructNavNamespace(this.namespaces[n], selectedMember, leadingWhitespace));
		}

		return namespaceContents.join(`\n${leadingWhitespace}`);
	}

	/**
	 * Constructs the navigation panel HTML for an API namespace and creates the required directory structure for its pages at `outputPath/apiSubPath`.
	 * @param {APINamespace} namespace - The namespace to construct the markup and directory structure for.
	 * @returns String A HTML string.
	 */

	#constructNavNamespace(namespace, selectedMember, leadingWhitespace)
	{
		fs.mkdirSync(this.#getAPINamespaceOutputPath(namespace.qualifiedName), { recursive: true });

		let content = this.templates.navNamespace.replace(/\n/g, `\n${leadingWhitespace}`);
		let membersContents = [];

		leadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.NAV_MEMBERS, content);

		for (let m = 0; m < namespace.members.length; m++)
		{
			let member = namespace.members[m];

			switch (member.definitionType)
			{
				case 'class':
				case 'struct':
				case 'interface':
				case 'enum':
				case 'delegate':
					membersContents.push(this.#constructNavMember(member, selectedMember, leadingWhitespace));
					break;
				case 'namespace':
					membersContents.push(this.#constructNavNamespace(member, selectedMember, leadingWhitespace));
					break;
				default:
					console.warn('Unhandled namespace member definition type "' + member.definitionType + '".');
					break;
			}
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_NAMESPACE), namespace.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBERS), membersContents.join(`\n${leadingWhitespace}`));

		return content;
	}

	#constructNavMember(member, selectedMember, leadingWhitespace)
	{
		let templates = this.templates;

		let content = selectedMember ? (selectedMember.id == member.id ? templates.navMemberThis : ((selectedMember.owner && selectedMember.owner.id == member.id) ? templates.navMemberMember : templates.navMember)) : templates.navMember;

		content = content.replace(/\n/g, `\n${leadingWhitespace}`);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBER_NAME), member.name);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBER_URL), this.#getAPIFileURL(member));

		return content;
	}

	/**
	 * Construct the section of an API page that provides information about members.
	 * @param {String} template - The template markup of the section.
	 * @param {String} leadingWhitespace - The leading whitespace of the markup of the section.
	 * @param {String} access - Access modifier for the section.
	 * @param {String} membersVar - The variable in the template markup where members should be inserted.
	 * @param {APIDefinition[]} members - The members belonging to the section.
	 * @param {Function} constructMember - Function that constructs the markup for each member.
	 * @param {String} memberTemplate - The template markup for each member.
	 * @returns 
	 */

	#constructMemberSection(template, leadingWhitespace, access, membersVar, members, constructMember, memberTemplate)
	{
		// console.log('constructMemberSection', {
		// 	access: access,
		// 	membersVar: membersVar,
		// 	members: members
		// });

		// let content = this.templates.navNamespace.replace(/\n/g, `\n${leadingWhitespace}`);
		// let membersContents = [];

		// leadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.NAV_MEMBERS, content);

		// for (let m = 0; m < namespace.members.length; m++)
		// {
		// 	let member = namespace.members[m];

		// 	switch (member.definitionType)
		// 	{
		// 		case 'class':
		// 		case 'struct':
		// 		case 'interface':
		// 		case 'enum':
		// 		case 'delegate':
		// 			membersContents.push(this.#constructNavMember(member, selectedMember, leadingWhitespace));
		// 			break;
		// 		case 'namespace':
		// 			membersContents.push(this.#constructNavNamespace(member, selectedMember, leadingWhitespace));
		// 			break;
		// 		default:
		// 			console.warn('Unhandled namespace member definition type "' + member.definitionType + '".');
		// 			break;
		// 	}
		// }

		// content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_NAMESPACE), namespace.name);
		// content = content.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBERS), membersContents.join(`\n${leadingWhitespace}`));

		let content = template.replace(/\n/g, `\n${leadingWhitespace}`);
		let membersContents = [];

		// let leadingWhitespace = DocBuilderTemplates.leadingWhitespace(membersVar, template);
		leadingWhitespace = DocBuilderTemplates.leadingWhitespace(membersVar, content);

		for (let i = 0; i < members.length; i++)
		{
			// members[i] = members[i].replace(/\n/g, '\n' + leadingWhitespace);

			membersContents.push(constructMember(memberTemplate, members[i], leadingWhitespace));
		}

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(access));
		// content = content.replace(DocBuilderVars.regExp(membersVar), members.join('\n' + leadingWhitespace));
		content = content.replace(DocBuilderVars.regExp(membersVar), membersContents.join(`\n${leadingWhitespace}`));

		return content;
	}

	#constructField(template, definition, leadingWhitespace)
	{
		let content = template.replace(/\n/g, `\n${leadingWhitespace}`);

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.access));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_NAME), this.#constructReference(definition, 'member-name'));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructProperty(template, definition, leadingWhitespace)
	{
		let content = template.replace(/\n/g, `\n${leadingWhitespace}`);

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.getAccess);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.getAccess));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_NAME), this.#constructReference(definition, 'member-name'));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_ACCESSORS), this.#constructPropertyAccess(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructMethod(template, definition, leadingWhitespace)
	{
		let content = template.replace(/\n/g, `\n${leadingWhitespace}`);

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.access));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_NAME), this.#constructMethodName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_PARAMETERS), this.#constructMethodParameters(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructEvent(template, definition, leadingWhitespace)
	{
		let content = template.replace(/\n/g, `\n${leadingWhitespace}`);

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.access));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_NAME), this.#constructReference(definition, 'member-name'));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_DESCRIPTION), definition.shortDescription);

		return content;
	}

	// #constructType(definition)
	// {
	// }

	// #constructParameter(definition)
	// {
	// }

	// #constructReturns(definition)
	// {
	// }

	#constructTitleText(text)
	{
		return text.replace(/\w[\w']*/g, function (t) { return t.charAt(0).toUpperCase() + t.substr(1); });
	}

	#constructObjectDeclaration(definition)
	{
		// NOTE Class, struct and interface declaration modifiers aren't supplied by Doxygen.

		let components = [definition.access, definition.definitionType, definition.name];

		if (definition.types && definition.types.length)
		{
			let typeParamComponents = [];

			for (let t = 0; t < definition.types.length; t++)
			{
				typeParamComponents.push(definition.types[t].identifier);
			}

			components.push('&lt;' + typeParamComponents.join(', ') + '&gt;');
		}

		let baseClasses = [];

		if (definition.inherits)
		{
			for (let b = 0; b < definition.inherits.length; b++)
			{
				baseClasses.push(this.#constructReference(definition.inherits[b]));
			}
		}

		let interfaces = [];

		if (definition.implements)
		{
			for (let i = 0; i < definition.implements.length; i++)
			{
				interfaces.push(this.#constructReference(definition.implements[i]));
			}
		}

		if (baseClasses.length || interfaces.length)
		{
			components.push(':');

			if (baseClasses.length)
			{
				components.push(baseClasses.join(', ') + (interfaces.length ? ',' : ''));
			}

			if (interfaces.length)
			{
				components.push(interfaces.join(', '));
			}
		}

		let memberDeclarationTemplate = this.templates.memberDeclaration;
		let memberDeclaration = components.join(' ') + ';';

		if (memberDeclarationTemplate)
		{
			return memberDeclarationTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), memberDeclaration);
		}

		return memberDeclaration;
	}

	#constructFieldDeclaration(definition)
	{
		let components = [definition.access];

		if (definition.static)
		{
			components.push('static');
		}

		components.push(this.#replaceIDLinks(definition.type));
		components.push(definition.name);

		let memberDeclarationTemplate = this.templates.memberDeclaration;
		let memberDeclaration = components.join(' ') + ';';

		if (memberDeclarationTemplate)
		{
			return memberDeclarationTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), memberDeclaration);
		}

		return memberDeclaration;
	}

	#constructPropertyDeclaration(definition)
	{
		let components = [definition.access];

		if (definition.static)
		{
			components.push('static');
		}

		components.push(this.#replaceIDLinks(definition.type));
		components.push(definition.name);
		components.push(' {');

		if (definition.getAccess == definition.access)
		{
			components.push('get;');
		}
		else
		{
			components.push(definition.getAccess + ' get;');
		}

		if (definition.setAccess == definition.access)
		{
			components.push('set;');
		}
		else if (definition.setAccess)
		{
			components.push(definition.setAccess + ' set;');
		}

		components.push('}');

		let memberDeclarationTemplate = this.templates.memberDeclaration;
		let memberDeclaration = components.join(' ');

		if (memberDeclarationTemplate)
		{
			return memberDeclarationTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), memberDeclaration);
		}

		return memberDeclaration;
	}

	#constructMethodDeclaration(definition)
	{
		let memberDeclaration = definition.access;

		if (definition.static)
		{
			memberDeclaration += ' static';
		}

		memberDeclaration += ' ' + this.#replaceIDLinks(definition.type) + ' ' + definition.name;

		if (definition.types && definition.types.length)
		{
			let typeParamComponents = [];

			for (let t = 0; t < definition.types.length; t++)
			{
				typeParamComponents.push(definition.types[t].identifier);
			}

			memberDeclaration += ' &lt;' + typeParamComponents.join(', ') + '&gt;';
		}

		memberDeclaration += ' (';

		if (definition.params)
		{
			let paramComponents = [];

			for (let i = 0; i < definition.params.length; i++)
			{
				let param = definition.params[i];
				let paramComponent = param.type + ' ' + param.name;

				if (param.defaultValue)
				{
					paramComponent += ' = ' + param.defaultValue;
				}

				paramComponents.push(paramComponent);
			}

			memberDeclaration += paramComponents.join(', ');
		}

		memberDeclaration += ');';

		let memberDeclarationTemplate = this.templates.memberDeclaration;

		if (memberDeclarationTemplate)
		{
			return memberDeclarationTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), memberDeclaration);
		}

		return memberDeclaration;
	}

	#constructEventDeclaration(definition)
	{
		let memberDeclaration = definition.access;

		if (definition.static)
		{
			memberDeclaration += ' static';
		}

		memberDeclaration += ' ' + this.#replaceIDLinks(definition.type) + ' ' + definition.name + ';';

		let memberDeclarationTemplate = this.templates.memberDeclaration;

		if (memberDeclarationTemplate)
		{
			return memberDeclarationTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), memberDeclaration);
		}

		return memberDeclaration;
	}

	#constructEnumDeclaration(definition)
	{
		// NOTE Enum access modifier doesn't appear to be supplied by Doxygen, assume public if not supplied.

		let components = [definition.access || 'public'];

		components.push('enum');
		components.push(definition.name);

		let memberDeclarationTemplate = this.templates.memberDeclaration;
		let memberDeclaration = components.join(' ') + ';';

		if (memberDeclarationTemplate)
		{
			return memberDeclarationTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), memberDeclaration);
		}

		return memberDeclaration;
	}

	#constructFullName(definition)
	{
		if (definition.owner)
		{
			return this.#constructReference(definition.owner) + '.' + definition.name;
		}

		return definition.name;
	}

	#constructQualifiedName(definition)
	{
		let components = [];

		if (definition.namespace)
		{
			components.push(definition.namespace);
		}

		if (definition.owner)
		{
			components.push(this.#constructReference(definition.owner));
		}

		components.push(definition.name);

		return components.join('.');
	}

	#constructInherits(definition)
	{
		// TODO Construct full inheritance chain.

		let baseClasses = [];

		for (let b = 0; b < definition.inherits.length; b++)
		{
			baseClasses.push(this.#constructReference(definition.inherits[b]));
		}

		let inheritsTemplate = this.templates.memberInherits;

		if (inheritsTemplate)
		{
			return inheritsTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS), baseClasses.join(', '));
		}

		return baseClasses.join(', ');
	}

	#constructImplements(definition)
	{
		// TODO Construct full implements list.

		let interfaces = [];

		for (let i = 0; i < definition.implements.length; i++)
		{
			interfaces.push(this.#constructReference(definition.implements[i]));
		}

		let implementsTemplate = this.templates.memberImplements;

		if (implementsTemplate)
		{
			return implementsTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS), interfaces.join(', '));
		}

		return interfaces.join(', ');
	}

	#constructNamespace(definition)
	{
		let namespaceTemplate = this.templates.memberNamespace;

		if (namespaceTemplate)
		{
			return namespaceTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), definition.namespace);
		}

		return definition.namespace;
	}

	#constructAssembly(definition)
	{
		let assemblyTemplate = this.templates.memberAssembly;

		if (assemblyTemplate)
		{
			return assemblyTemplate.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), definition.assembly);
		}

		return definition.assembly;
	}

	#constructOwner(definition)
	{
		if (definition.owner)
		{
			return this.#constructReference(definition.owner);
		}

		return '';
	}

	#constructPropertyAccess(definition)
	{
		let accessors = [];

		if (definition.getAccess)
		{
			accessors.push('get;');
		}

		if (definition.setAccess)
		{
			accessors.push((definition.setAccess == definition.getAccess) ? 'set;' : (definition.setAccess + ' set;'));
		}

		return accessors.join(' ');
	}

	#constructMethodName(definition)
	{
		let methodName = '<a class="member-name" href="' + this.#getAPIFileURL(definition) + '">' + definition.name + '</a>';

		if (definition.types && definition.types.length)
		{
			let typeParamComponents = [];

			for (let t = 0; t < definition.types.length; t++)
			{
				typeParamComponents.push(definition.types[t].identifier);
			}

			methodName += ' &lt;' + typeParamComponents.join(', ') + '&gt;';
		}

		return methodName;
	}

	#constructMethodParameters(definition)
	{
		if (definition.params && definition.params.length)
		{
			let paramComponents = [];

			for (let p = 0; p < definition.params.length; p++)
			{
				let param = definition.params[p];

				paramComponents.push(this.#replaceIDLinks(param.type) + ' ' + param.name);
			}

			let padding = this.parameterPadding || '';

			return padding + paramComponents.join(', ') + padding;
		}

		return '';
	}

	#constructReference(reference, classes)
	{
		let definition = this.definitions[reference.id];

		if (definition)
		{
			if (classes)
			{
				return '<a class="' + classes + '" href="' + this.#getAPIFileURL(definition) + '">' + definition.name + '</a>';
			}

			return '<a href="' + this.#getAPIFileURL(definition) + '">' + definition.name + '</a>';
		}

		if (classes)
		{
			return '<span class="' + classes + '">' + definition.name + '</span>';
		}

		return reference.name;
	}

	/**
	 * Add search details to {@linkcode searchData}.
	 * @param {APIDefinition} definition - API definition to create the search data for.
	 */

	#addSearchData(definition)
	{
		let data = this.#searchData;
		let text = definition.name.toLowerCase().replace(/\[.*]/g, '').match(/[^\.]+$/)[0];// TODO Better solution to handling indexers and nested types.

		if (!data[text])
		{
			data[text] = [];
		}

		data[text].push({
			name: definition.owner ? this.definitions[definition.owner.id].name + '.' + definition.name : definition.name,
			description: definition.description,
			url: this.#getAPIFileURL(definition)
		});
	}

	#replaceIDLinks(text)
	{
		// Replace id with url to page.

		text = text.replace(/(?<=href=")(.*?)(?=")/g, ((id) => {
			let definition = this.definitions[id];
			if (definition)
			{
				return this.#getAPIFileURL(definition);
			}
			return '';
		}).bind(this));

		// Links to template types?

		text = text.replace(/^\w+|(?<=[\s,]|&lt;)\w+/g, ((word) => {
			for (let id in this.definitions)
			{
				let definition = this.definitions[id];
				if (definition.name == word)
				{
					switch (definition.definitionType)
					{
						case 'class':
						case 'struct':
						case 'interface':
						case 'enum':
						case 'delegate':
							return '<a href="' + this.#getAPIFileURL(definition) + '">' + word + '</a>';
					}
				}
			}
			return word;
		}).bind(this));

		return text;
	}

	/**
	 * Returns the output directory path for a given API namespace.
	 * @param {String} qualifiedNamespace - The API namespace to get the directory path for.
	 * @returns {String} A directory path.
	 */

	#getAPINamespaceOutputPath(qualifiedNamespace)
	{
		return this.#getOutputPath(this.#getAPINamespacePath(qualifiedNamespace));
	}

	/**
	 * Returns the output page file path name of a given API definition.
	 * @param {APIDefinition} definition - The API definition to get the page file name for.
	 * @returns {String} A file path name.
	 */

	#getAPIFileOutputPathName(definition)
	{
		return this.#getOutputPath(this.#getAPIFilePathName(definition));
	}

	/**
	 * Returns the full output path for a given sub path.
	 * @param {String} subPath - The sub path to get the full output path for.
	 * @returns String A path.
	 */

	#getOutputPath(subPath)
	{
		return subPath ? (this.outputPath ? this.outputPath + '/' + subPath : subPath) : this.outputPath;
	}

	/**
	 * Get the URL for the page of a given API definition.
	 * @param {APIDefinition} definition - The API definition to get the page URL for.
	 * @returns {String} A URL.
	 */

	#getAPIFileURL(definition)
	{
		return this.urlRootPath + '/' + this.#getAPIFilePathName(definition);
	}

	/**
	 * Returns the relative directory path (from {@linkcode outputPath}/{@linkcode urlRootPath}) for a given API namespace.
	 * @param {String} qualifiedNamespace - The API namespace to get the directory path for.
	 * @returns String A directory path.
	 */

	#getAPINamespacePath(qualifiedNamespace)
	{
		let namespacePath = qualifiedNamespace.replace(/\./g, '/');

		return this.apiSubPath ? this.apiSubPath + '/' + namespacePath : namespacePath;
	}

	/**
	 * Returns the relative page file path name (from {@linkcode outputPath}/{@linkcode urlRootPath}) for a given API definition.
	 * @param {APIDefinition} definition - The API definition to get the file path name for.
	 * @returns {String} A file path name.
	 */

	#getAPIFilePathName(definition)
	{
		let fileBaseName = definition.qualifiedName.substr(definition.namespace.length + 1);

		if (definition.overloads && definition.overloads.length)
		{
			if (definition.params && definition.params.length)
			{
				for (let i = 0; i < definition.params.length; i++)
				{
					fileBaseName += '-' + this.#getSafeTypeName(definition.params[i].type);
				}
			}

			if (definition.type && definition.type != 'void')
			{
				fileBaseName += '--' + this.#getSafeTypeName(definition.type);
			}

			if (fileBaseName.indexOf(' ') != -1)
			{
				console.log('Overloaded method', definition);
				throw 'Desired file name "' + fileBaseName + '" contains spaces.';
			}
		}

		return this.#getAPINamespacePath(definition.namespace) + '/' + fileBaseName + '.' + this.outputFileExtension;
	}

	/**
	 * Converts a type name so that it can be safely used in a file name.
	 * @param {String} typeName - The type name to convert.
	 * @returns {String} A safe name.
	 */

	#getSafeTypeName(typeName)
	{
		typeName = typeName.trim();
		typeName = typeName.replace(/<\/?[^>]*>/g, '');// Strip tags, such a links.
		typeName = typeName.replace(/\s*&lt;\s*/g, '_');// Replace opening template bracket with underscore.
		typeName = typeName.replace(/\s*&gt;\s*/g, '');// Strip closing template bracket.
		typeName = typeName.replace(/\s*,\s*/g, '_');// Replace template type separating comma with underscore.
		typeName = typeName.replace(/\s*\[\]/g, '_');// Replace array brackets with underscore.
		typeName = typeName.match(/\w+$/)[0];// Pulls out the last word in the param type name (stripping parent type/s or keywords such as out or ref).

		return typeName;
	}
}