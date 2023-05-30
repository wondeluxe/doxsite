import DocBuilderTemplates from './docbuildertemplates.js';
import DocBuilderVars from './docbuildervars.js';
import fs from 'fs';

/**
 * Generates API documentation.
 */

export default class DocBuilder extends EventTarget
{
	/** Array of APINamespaces, containing members, to build the documentation for. */
	namespaces = null;

	/** Object containing all members to build documentation for, referenced by id. */
	definitions = null;

	/** Template HTML markup to use when building documentation pages. */
	templates = null;

	/** Path where documentation pages will be built. */
	outputPath = null;

	/** File extension for built pages. */
	outputFileExtension = null;

	/** URL path to the documentation site root on the server/hosting environment. */
	urlRootPath = null;

	/** Relative path from `urlRootPath` to the documentation files. */
	apiSubPath = null;

	/** Optional padding for parameters between brackets. */
	parameterPadding = null;

	constructor(namespaces, definitions, templates, outputPath, outputFileExtension, urlRootPath, apiSubPath)
	{
		super();
		this.namespaces = namespaces || null;
		this.definitions = definitions || null;
		this.templates = templates || null;
		this.outputPath = outputPath || null;
		this.outputFileExtension = outputFileExtension || 'html';
		this.urlRootPath = urlRootPath || null;
		this.apiSubPath = apiSubPath || null;
	}

	buildDocs()
	{
		let navSectionLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.NAV_SECTION, this.templates.page);

		let namespaces = this.namespaces;

		let navNamespaces = [];

		// First iteration build the nav.
		for (let n = 0; n < namespaces.length; n++)
		{
			navNamespaces.push(this.#constructNavNamespace(namespaces[n]).replace(/\n/g, '\n' + navSectionLeadingWhitespace));
		}

		let navSection = navNamespaces.join('\n' + navSectionLeadingWhitespace);

		// console.log(navSectionLeadingWhitespace + navSection);

		// Second iteration build the pages.
		for (let n = 0; n < namespaces.length; n++)
		{
			this.#buildNamespacePages(namespaces[n], navSection);
		}

		this.dispatchEvent(new Event('complete'));
	}

	#buildNamespacePages(namespace, navSection)
	{
		for (let m = 0; m < namespace.members.length; m++)
		{
			// let pageURL = this.#buildMemberPage(namespace.members[m]);

			let member = namespace.members[m];

			switch (member.definitionType)
			{
				case 'class':
				case 'struct':
				case 'interface':
					this.#buildObjectPage(member, navSection);
					break;
				case 'enum':
					this.#buildEnumPage(member, navSection);
					break;
				case 'delegate':
					this.#buildMethodPage(member, navSection);
					break;
				case 'namespace':
					this.#buildNamespacePages(member, navSection);
					break;
				default:
					console.warn('Unhandled namespace member definition type "' + member.definitionType + '".');
					break;
			}
		}
	}

	#buildObjectPage(definition, navSection)
	{
		let templates = this.templates;

		let fieldSections = {
			all: { pageVar: DocBuilderVars.FIELD_SECTION, template: templates.fieldSection, access: '', contents: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_FIELD_SECTION, template: templates.instanceFieldSection, access: '', contents: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_FIELD_SECTION, template: templates.publicFieldSection, access: 'public', contents: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_FIELD_SECTION, template: templates.protectedFieldSection, access: 'protected', contents: [] },
			static: { pageVar: DocBuilderVars.STATIC_FIELD_SECTION, template: templates.staticFieldSection, access: '', contents: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, template: templates.publicStaticFieldSection, access: 'public', contents: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, template: templates.protectedStaticFieldSection, access: 'protected', contents: [] }
		};

		let propertySections = {
			all: { pageVar: DocBuilderVars.PROPERTY_SECTION, template: templates.propertySection, access: '', contents: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_PROPERTY_SECTION, template: templates.instancePropertySection, access: '', contents: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_PROPERTY_SECTION, template: templates.publicPropertySection, access: 'public', contents: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_PROPERTY_SECTION, template: templates.protectedPropertySection, access: 'protected', contents: [] },
			static: { pageVar: DocBuilderVars.STATIC_PROPERTY_SECTION, template: templates.staticPropertySection, access: '', contents: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, template: templates.publicStaticPropertySection, access: 'public', contents: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, template: templates.protectedStaticPropertySection, access: 'protected', contents: [] }
		};

		let methodSections = {
			all: { pageVar: DocBuilderVars.METHOD_SECTION, template: templates.methodSection, access: '', contents: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_METHOD_SECTION, template: templates.instanceMethodSection, access: '', contents: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_METHOD_SECTION, template: templates.publicMethodSection, access: 'public', contents: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_METHOD_SECTION, template: templates.protectedMethodSection, access: 'protected', contents: [] },
			static: { pageVar: DocBuilderVars.STATIC_METHOD_SECTION, template: templates.staticMethodSection, access: '', contents: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, template: templates.publicStaticMethodSection, access: 'public', contents: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, template: templates.protectedStaticMethodSection, access: 'protected', contents: [] }
		};

		let eventSections = {
			all: { pageVar: DocBuilderVars.EVENT_SECTION, template: templates.eventSection, access: '', contents: [] },
			instance: { pageVar: DocBuilderVars.INSTANCE_EVENT_SECTION, template: templates.instanceEventSection, access: '', contents: [] },
			public: { pageVar: DocBuilderVars.PUBLIC_EVENT_SECTION, template: templates.publicEventSection, access: 'public', contents: [] },
			protected: { pageVar: DocBuilderVars.PROTECTED_EVENT_SECTION, template: templates.protectedEventSection, access: 'protected', contents: [] },
			static: { pageVar: DocBuilderVars.STATIC_EVENT_SECTION, template: templates.staticEventSection, access: '', contents: [] },
			publicStatic: { pageVar: DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, template: templates.publicStaticEventSection, access: 'public', contents: [] },
			protectedStatic: { pageVar: DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, template: templates.protectedStaticEventSection, access: 'protected', contents: [] }
		};

		let memberDefinitionTypes = [
			{ sections: fieldSections, membersVar: DocBuilderVars.FIELDS },
			{ sections: propertySections, membersVar: DocBuilderVars.PROPERTIES },
			{ sections: methodSections, membersVar: DocBuilderVars.METHODS },
			{ sections: eventSections, membersVar: DocBuilderVars.EVENTS }
		];

		for (let m = 0; m < definition.members.length; m++)
		{
			let member = definition.members[m];

			let memberTemplates = null;
			// let memberLeadingWhitespace = null;
			let memberSections = null;
			let constructMember = null;

			switch (member.definitionType)
			{
				case 'field':
					memberTemplates = templates.fields;
					// memberLeadingWhitespace = fieldLeadingWhitespace;
					memberSections = fieldSections;
					constructMember = this.#constructField.bind(this);
					this.#buildFieldPage(member, navSection);
					break;
				case 'property':
					memberTemplates = templates.properties;
					// memberLeadingWhitespace = propertyLeadingWhitespace;
					memberSections = propertySections;
					constructMember = this.#constructProperty.bind(this);
					this.#buildPropertyPage(member, navSection);
					break;
				case 'method':
					memberTemplates = templates.methods;
					// memberLeadingWhitespace = methodLeadingWhitespace;
					memberSections = methodSections;
					constructMember = this.#constructMethod.bind(this);
					this.#buildMethodPage(member, navSection);
					break;
				case 'event':
					memberTemplates = templates.events;
					// memberLeadingWhitespace = eventLeadingWhitespace;
					memberSections = eventSections;
					constructMember = this.#constructEvent.bind(this);
					this.#buildEventPage(member, navSection);
					break;
				default:
					throw new Error('Unhandled namespace member definition type "' + member.definitionType + '".');
			}

			let template = null;
			// let leadingWhitespace = null;
			let contents = [memberSections.all.contents];

			contents.push(member.static ? memberSections.static.contents : memberSections.instance.contents);

			if (member.access == 'public')
			{
				if (member.static)
				{
					template = memberTemplates.publicStatic;
					// leadingWhitespace = memberLeadingWhitespace.publicStatic;
					contents.push(memberSections.publicStatic.contents);
				}
				else
				{
					template = memberTemplates.public;
					// leadingWhitespace = memberLeadingWhitespace.public;
					contents.push(memberSections.public.contents);
				}
			}
			else if (member.access == 'protected')
			{
				if (member.static)
				{
					template = memberTemplates.protectedStatic;
					// leadingWhitespace = memberLeadingWhitespace.protectedStatic;
					contents.push(memberSections.protectedStatic.contents);
				}
				else
				{
					template = memberTemplates.protected;
					// leadingWhitespace = memberLeadingWhitespace.protected;
					contents.push(memberSections.protected.contents);
				}
			}
			else
			{
				throw new Error('Unhandled member protection level "' + member.access + '".');
			}

			let content = constructMember(template, member);

			for (let c = 0; c < contents.length; c++)
			{
				// contents[c].push(content.replace(/\n/g, '\n' + leadingWhitespace));
				contents[c].push(content);
			}
		}

		let filePathName = this.#getFilePathName(definition);
		let urlRootPath = this.urlRootPath;

		let page = templates.page;

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), urlRootPath);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), navSection);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME_TEXT), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructObjectDeclaration(definition));

		if (definition.inherits.length)
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS), this.#constructInherits(definition));
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		}

		if (definition.implements.length)
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS), this.#constructImplements(definition));
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		}

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));

		if (definition.description)
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		// NOTE Type parameter constraints aren't supplied by Doxygen.

		if (definition.types && definition.types.length)
		{
			let typeParamsContents = [];

			for (let i = 0; i < definition.types.length; i++)
			{
				let typeParam = definition.types[i];
				let typeParamContent = templates.typeParameter;

				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_NAME), '<span class="member-name">' + typeParam.identifier + '</span>');
				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_DESCRIPTION), typeParam.description);

				typeParamsContents.push(typeParamContent);
			}

			// TODO Handle indentation.

			let templateParamSection = templates.typeParameterSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETERS), typeParamsContents.join('\n'));

			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION), templateParamSection);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		}

		// The following loop handles all field, property, method and event section properties on the page.

		for (let t = 0; t < memberDefinitionTypes.length; t++)
		{
			let definitionType = memberDefinitionTypes[t];

			for (let sectionName in definitionType.sections)
			{
				let section = definitionType.sections[sectionName];

				if (section.contents.length)
				{
					let sectionContent = this.#constructMemberSection(section.template, section.access, definitionType.membersVar, section.contents);
					let sectionLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(section.pageVar, section.template);

					page = page.replace(DocBuilderVars.regExp(section.pageVar), sectionContent.replace(/\n/g, '\n' + sectionLeadingWhitespace));
				}
				else
				{
					page = page.replace(DocBuilderVars.regExp(section.pageVar, true), '');
				}
			}
		}

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.outputPath + '/' + filePathName, page);
	}

	#buildFieldPage(definition, navSection)
	{
		// TODO Ensure Type is linked if defined in package.

		let templates = this.templates;

		let filePathName = this.#getFilePathName(definition);
		let urlRootPath = this.urlRootPath;

		let page = templates.page;

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), urlRootPath);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), navSection);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME_TEXT), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructFieldDeclaration(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));

		if (definition.description)
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');

		let typeSection = templates.typeSection;
		typeSection = typeSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE), this.#replaceIDLinks(definition.type));

		// page = page.replace(DocBuilderVars.regExp(section.pageVar), sectionContent.replace(/\n/g, '\n' + sectionLeadingWhitespace));

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION), typeSection);

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.outputPath + '/' + filePathName, page);
	}

	#buildPropertyPage(definition, navSection)
	{
		let templates = this.templates;

		let filePathName = this.#getFilePathName(definition);
		let urlRootPath = this.urlRootPath;

		let page = templates.page;

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), urlRootPath);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), navSection);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME_TEXT), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructPropertyDeclaration(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));

		if (definition.description)
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');

		let typeSection = templates.typeSection;
		typeSection = typeSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE), this.#replaceIDLinks(definition.type));

		// page = page.replace(DocBuilderVars.regExp(section.pageVar), sectionContent.replace(/\n/g, '\n' + sectionLeadingWhitespace));

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION), typeSection);

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.outputPath + '/' + filePathName, page);
	}

	#buildMethodPage(definition, navSection)
	{
		let templates = this.templates;

		let filePathName = this.#getFilePathName(definition);
		let urlRootPath = this.urlRootPath;

		// TODO Fix leading whitespace.

		let page = templates.page;

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), urlRootPath);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), navSection);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME_TEXT), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructMethodDeclaration(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));

		if (definition.description)
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION, true), '');
		}

		// NOTE Type parameter constraints aren't supplied by Doxygen.

		if (definition.types && definition.types.length)
		{
			let typeParamsContents = [];

			for (let i = 0; i < definition.types.length; i++)
			{
				let typeParam = definition.types[i];
				let typeParamContent = templates.typeParameter;

				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_NAME), '<span class="member-name">' + typeParam.identifier + '</span>');
				typeParamContent = typeParamContent.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_DESCRIPTION), typeParam.description);

				typeParamsContents.push(typeParamContent);
			}

			// TODO Handle indentation.

			let templateParamSection = templates.typeParameterSection.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETERS), typeParamsContents.join('\n'));

			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION), templateParamSection);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		}

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');

		if (definition.params && definition.params.length)
		{
			let paramsContents = [];

			for (let i = 0; i < definition.params.length; i++)
			{
				let param = definition.params[i];
				let paramContent = templates.parameter;

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

			// TODO Handle indentation.

			let paramSection = templates.parameterSection.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETERS), paramsContents.join('\n'));

			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION), paramSection);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		}

		if (definition.type && definition.type.indexOf('void') < 0)
		{
			let returnSection = templates.returnSection;

			returnSection = returnSection.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_TYPE), this.#replaceIDLinks(definition.type));
			returnSection = returnSection.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_DESCRIPTION), definition.returnsDescription);

			// TODO Handle indentation.

			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION), returnSection);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		}

		if (definition.overloads && definition.overloads.length)
		{
			let overloadsContents = [];

			for (let i = 0; i < definition.overloads.length; i++)
			{
				let method = this.definitions[definition.overloads[i].id];
				let methodContent = this.#constructMethod(templates.method, method);

				overloadsContents.push(methodContent);
			}

			// TODO Handle indentation.

			let overloadSection = templates.overloadSection.replace(DocBuilderVars.regExp(DocBuilderVars.METHODS), overloadsContents.join('\n'));

			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION), overloadSection);
		}
		else
		{
			page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		}

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.outputPath + '/' + filePathName, page);
	}

	#buildEventPage(definition, navSection)
	{
		let templates = this.templates;

		let filePathName = this.#getFilePathName(definition);
		let urlRootPath = this.urlRootPath;

		// TODO Fix leading whitespace.

		let page = templates.page;

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), urlRootPath);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), navSection);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME_TEXT), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructEventDeclaration(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.outputPath + '/' + filePathName, page);
	}

	#buildEnumPage(definition, navSection)
	{
		let templates = this.templates;

		let filePathName = this.#getFilePathName(definition);
		let urlRootPath = this.urlRootPath;

		let page = templates.page;

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.ROOT_PATH), urlRootPath);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_SECTION), navSection);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAME_TEXT), definition.name);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TEXT), definition.definitionType);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_TYPE_TITLE_TEXT), this.#constructTitleText(definition.definitionType));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_DECLARATION), this.#constructEnumDeclaration(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_INHERITS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_IMPLEMENTS, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_NAMESPACE), this.#constructNamespace(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.MEMBER_ASSEMBLY), this.#constructAssembly(definition));
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.DESCRIPTION_SECTION), definition.description);
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_FIELD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_PROPERTY_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_METHOD_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.INSTANCE_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PUBLIC_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PROTECTED_STATIC_EVENT_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.TYPE_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.PARAMETER_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.RETURN_SECTION, true), '');
		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.OVERLOAD_SECTION, true), '');

		// TODO Fix leading whitespace.

		let valuesContent = [];

		for (let i = 0; i < definition.values.length; i++)
		{
			let value = definition.values[i];
			let valueContent = templates.value;

			valueContent = valueContent.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_NAME), '<span class="member-name">' + value.name + '</span>');
			valueContent = valueContent.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_DESCRIPTION), value.description);

			valuesContent.push(valueContent);
		}

		let valueSection = templates.valueSection;
		valueSection = valueSection.replace(DocBuilderVars.regExp(DocBuilderVars.VALUES), valuesContent.join('\n'));

		// page = page.replace(DocBuilderVars.regExp(section.pageVar), sectionContent.replace(/\n/g, '\n' + sectionLeadingWhitespace));

		page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION), valueSection);
		// page = page.replace(DocBuilderVars.regExp(DocBuilderVars.VALUE_SECTION, true), '');

		fs.writeFileSync(this.outputPath + '/' + filePathName, page);
	}

	#constructNavNamespace(namespace)
	{
		let navNamespace = this.templates.navNamespace;
		navNamespace = navNamespace.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_NAMESPACE), namespace.name);

		let navMemberLeadingWhitespace = DocBuilderTemplates.leadingWhitespace(DocBuilderVars.NAV_MEMBERS, navNamespace);

		let navMembers = [];

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
					let navMember = this.templates.navMember;
					navMember = navMember.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBER_NAME), member.name);
					navMember = navMember.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBER_URL), this.#getFileURL(member));
					navMember = navMember.replace(/\n/g, '\n' + navMemberLeadingWhitespace);
					navMembers.push(navMember);
					break;
				case 'namespace':
					navMembers.push(this.#constructNavNamespace(member).replace(/\n/g, '\n' + navMemberLeadingWhitespace));
					break;
				default:
					console.warn('Unhandled namespace member definition type "' + member.definitionType + '".');
					break;
			}
		}

		fs.mkdirSync(this.outputPath + '/' + namespace.qualifiedName.replace(/\./g, '/'), { recursive: true });

		return navNamespace.replace(DocBuilderVars.regExp(DocBuilderVars.NAV_MEMBERS), navMembers.join('\n' + navMemberLeadingWhitespace));
	}

	#constructMemberSection(template, access, membersVar, members)
	{
		console.log('constructMemberSection', {
			access: access,
			membersVar: membersVar,
			members: members
		});

		let leadingWhitespace = DocBuilderTemplates.leadingWhitespace(membersVar, template);

		for (let i = 0; i < members.length; i++)
		{
			members[i] = members[i].replace(/\n/g, '\n' + leadingWhitespace);
		}

		let content = template;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(access));
		content = content.replace(DocBuilderVars.regExp(membersVar), members.join('\n' + leadingWhitespace));

		return content;
	}

	#constructField(template, definition)
	{
		let content = template;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.access));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_NAME), this.#constructReference(definition, 'member-name'));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.FIELD_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructProperty(template, definition)
	{
		let content = template;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.getAccess);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.getAccess));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_NAME), this.#constructReference(definition, 'member-name'));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_ACCESSORS), this.#constructPropertyAccess(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.PROPERTY_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructMethod(template, definition)
	{
		let content = template;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.access));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_NAME), this.#constructMethodName(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_PARAMETERS), this.#constructMethodParameters(definition));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.METHOD_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructEvent(template, definition)
	{
		let content = template;

		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TEXT), definition.access);
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.ACCESS_TITLE_TEXT), this.#constructTitleText(definition.access));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_TYPE), this.#replaceIDLinks(definition.type));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_NAME), this.#constructReference(definition, 'member-name'));
		content = content.replace(DocBuilderVars.regExp(DocBuilderVars.EVENT_DESCRIPTION), definition.shortDescription);

		return content;
	}

	#constructType(definition)
	{

	}

	#constructParameter(definition)
	{

	}

	#constructReturns(definition)
	{

	}

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
		let methodName = '<a class="member-name" href="' + this.#getFileURL(definition) + '">' + definition.name + '</a>';

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

			let padding = this.parameterPadding;

			if (padding)
			{
				return padding + paramComponents.join(' ') + padding;
			}

			return paramComponents.join(', ');
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
				return '<a class="' + classes + '" href="' + this.#getFileURL(definition) + '">' + definition.name + '</a>';
			}

			return '<a href="' + this.#getFileURL(definition) + '">' + definition.name + '</a>';
		}

		if (classes)
		{
			return '<span class="' + classes + '">' + definition.name + '</span>';
		}

		return reference.name;
	}

	#replaceIDLinks(text)
	{
		text = text.replace(/(?<=href=")(.*?)(?=")/g, ((id) => {
			let definition = this.definitions[id];
			if (definition)
			{
				return this.#getFileURL(definition);
			}
			return '';
		}).bind(this));

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
							return '<a href="' + this.#getFileURL(definition) + '">' + word + '</a>';
					}
				}
			}
			return word;
		}).bind(this));

		return text;
	}

	#getFilePathName(definition)
	{
		let filePath = definition.namespace.replace(/\./g, '/');
		let fileBaseName = definition.qualifiedName.substr(definition.namespace.length + 1);

		if (definition.overloads && definition.overloads.length && definition.params && definition.params.length)
		{
			for (let i = 0; i < definition.params.length; i++)
			{
				fileBaseName += '-' + definition.params[i].type.replace(/<\/?a[^>]*>/g, '');
			}
		}

		return filePath + '/' + fileBaseName + '.' + this.outputFileExtension;
	}

	#getFileURL(definition)
	{
		return this.urlRootPath.replace(/\/+$/, '') + '/' + this.apiSubPath.replace(/\/+$/, '') + '/' + this.#getFilePathName(definition);
	}
}