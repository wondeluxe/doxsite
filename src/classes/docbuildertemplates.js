import DocBuilderMemberTemplates from './docbuildermembertemplates.js';
import fs from 'fs';

/**
 * Defines the template HTML markup for a `DocBuilder`.
 */

export default class DocBuilderTemplates
{
	/** @type {String} Index page template. */

	index = null;

	/** @type {String} Search page template. */

	search = null;

	/** @type {String} Main page template that all API pages are constructed from. */

	page = null;

	/** @type {String} Markup for type/member declarations. */

	memberDeclaration = null;

	/** @type {String} Markup for type inheritance. */

	memberInherits = null;

	/** @type {String} Markup for interfaces implemented by a type. */

	memberImplements = null;

	/** @type {String} Markup for the listed item's namespace. */

	memberNamespace = null;

	/** @type {String} Markup for the listed item's assembly. */

	memberAssembly = null;

	/** @type {String} Markup for a namespace that appears in the nav menu on a page. */

	navNamespace = null;

	/** @type {String} Markup for an item (class/struct/enum etc.) that is listed in the nav menu under a namespace. */

	navMember = null;

	/** @type {String} Markup for the currently selected item (class/struct/enum etc.) that is listed in the nav menu under a namespace. */

	navMemberSelected = null;

	/** @type {String} Markup for the description section of a page. */

	descriptionSection = null;

	/** @type {String} Markup for the section of a page that documents an item's type/template parameters. */

	typeParameterSection = null;

	/** @type {String} Markup for a documented type/template parameter. */

	typeParameter = null;

	/** @type {String} Markup for the section of a page that documents an item's fields. */

	fieldSection = null;

	/** @type {String} Markup for a documented field. */

	field = null;

	/** @type {String} Markup for the section of a page that documents an item's properties. */

	propertySection = null;

	/** @type {String} Markup for a documented property. */

	property = null;

	/** @type {String} Markup for the section of a page that documents an item's methods. */

	methodSection = null;

	/** @type {String} Markup for a documented method. */

	method = null;

	/** @type {String} Markup for the section of a page that documents an item's events. */

	eventSection = null;

	/** @type {String} Markup for a documented event. */

	event = null;

	/** @type {String} Markup for the section of a page that documents an item's instance/non-static fields. */

	instanceFieldSection = null;

	/** @type {String} Markup for a documented instance/non-static field. */

	instanceField = null;

	/** @type {String} Markup for the section of a page that documents an item's instance/non-static properties. */

	instancePropertySection = null;

	/** @type {String} Markup for a documented instance/non-static property. */

	instanceProperty = null;

	/** @type {String} Markup for the section of a page that documents an item's instance/non-static methods. */

	instanceMethodSection = null;

	/** @type {String} Markup for a documented instance/non-static method. */

	instanceMethod = null;

	/** @type {String} Markup for the section of a page that documents an item's instance/non-static events. */

	instanceEventSection = null;

	/** @type {String} Markup for a documented instance/non-static event. */

	instanceEvent = null;

	/** @type {String} Markup for the section of a page that documents an item's public fields. */

	publicFieldSection = null;

	/** @type {String} Markup for a documented public field. */

	publicField = null;

	/** @type {String} Markup for the section of a page that documents an item's public properties. */

	publicPropertySection = null;

	/** @type {String} Markup for a documented public property. */

	publicProperty = null;

	/** @type {String} Markup for the section of a page that documents an item's public methods. */

	publicMethodSection = null;

	/** @type {String} Markup for a documented public method. */

	publicMethod = null;

	/** @type {String} Markup for the section of a page that documents an item's public events. */

	publicEventSection = null;

	/** @type {String} Markup for a documented public event. */

	publicEvent = null;

	/** @type {String} Markup for the section of a page that documents an item's protected fields. */

	protectedFieldSection = null;

	/** @type {String} Markup for a documented protected field. */

	protectedField = null;

	/** @type {String} Markup for the section of a page that documents an item's protected properties. */

	protectedPropertySection = null;

	/** @type {String} Markup for a documented protected property. */

	protectedProperty = null;

	/** @type {String} Markup for the section of a page that documents an item's protected methods. */

	protectedMethodSection = null;

	/** @type {String} Markup for a documented protected method. */

	protectedMethod = null;

	/** @type {String} Markup for the section of a page that documents an item's protected events. */

	protectedEventSection = null;

	/** @type {String} Markup for a documented protected method. */

	protectedEvent = null;

	/** @type {String} Markup for the section of a page that documents an item's static fields. */

	staticFieldSection = null;

	/** @type {String} Markup for a documented static field. */

	staticField = null;

	/** @type {String} Markup for the section of a page that documents an item's static properties. */

	staticPropertySection = null;

	/** @type {String} Markup for a documented static property. */

	staticProperty = null;

	/** @type {String} Markup for the section of a page that documents an item's static methods. */

	staticMethodSection = null;

	/** @type {String} Markup for a documented static method. */

	staticMethod = null;

	/** @type {String} Markup for the section of a page that documents an item's static events. */

	staticEventSection = null;

	/** @type {String} Markup for a documented static event. */

	staticEvent = null;

	/** @type {String} Markup for the section of a page that documents an item's public static fields. */

	publicStaticFieldSection = null;

	/** @type {String} Markup for a documented public static field. */

	publicStaticField = null;

	/** @type {String} Markup for the section of a page that documents an item's public static properties. */

	publicStaticPropertySection = null;

	/** @type {String} Markup for a documented public static property. */

	publicStaticProperty = null;

	/** @type {String} Markup for the section of a page that documents an item's public static methods. */

	publicStaticMethodSection = null;
	
	/** @type {String} Markup for a documented public static method. */

	publicStaticMethod = null;

	/** @type {String} Markup for the section of a page that documents an item's public static events. */

	publicStaticEventSection = null;

	/** @type {String} Markup for a documented public static event. */

	publicStaticEvent = null;

	/** @type {String} Markup for the section of a page that documents an item's protected static fields. */

	protectedStaticFieldSection = null;

	/** @type {String} Markup for a documented protected static field. */

	protectedStaticField = null;

	/** @type {String} Markup for the section of a page that documents an item's protected static properties. */

	protectedStaticPropertySection = null;

	/** @type {String} Markup for a documented protected static property. */

	protectedStaticProperty = null;
	/** @type {String} Markup for the section of a page that documents an item's protected static methods. */

	protectedStaticMethodSection = null;

	/** @type {String} Markup for a documented protected static method. */

	protectedStaticMethod = null;

	/** @type {String} Markup for the section of a page that documents an item's protected static events. */

	protectedStaticEventSection = null;

	/** @type {String} Markup for a documented protected static event. */

	protectedStaticEvent = null;

	/** @type {String} Markup for the section of a field or property page's that documents its type. */

	typeSection = null;

	/** @type {String} Markup for the section of a method's page that documents its parameters. */

	parameterSection = null;

	/** @type {String} Markup for a documented method parameter. */

	parameter = null;

	/** @type {String} Markup for the section of a method's page that documents its return value. */

	returnSection = null;

	/** @type {String} Markup for the section of a method's page that documents its overloards. */

	overloadSection = null;

	/** @type {String} Markup for the section of an enum's page that documents its values. */

	valueSection = null;

	/** @type {String} Markup for a documented enum value. */

	value = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMemberSections that contains templates for all field sections */

	fieldSections = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMemberSections that contains all templates for all property sections. */

	propertySections = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMemberSections that contains all templates for all method sections. */

	methodSections = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMemberSections that contains all templates for event sections. */

	eventSections = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMembers that contains all templates for all fields. */

	fields = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMembers that contains all templates for all properties. */

	properties = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMembers that contains all templates for all methods:. */

	methods = null;

	/** @type {DocBuilderMemberTemplates} Object populated in updateMembers that contains all templates for all events. */

	events = null;

	constructor(templates)
	{
		if (templates)
		{
			this.index = templates.index || null;
			this.search = templates.search || null;
			this.page = templates.page || null;
			this.memberDeclaration = templates.memberDeclaration || null;
			this.memberInherits = templates.memberInherits || null;
			this.memberImplements = templates.memberImplements || null;
			this.memberNamespace = templates.memberNamespace || null;
			this.memberAssembly = templates.memberAssembly || null;
			this.navNamespace = templates.navNamespace || null;
			this.navMember = templates.navMember || null;
			this.descriptionSection = templates.descriptionSection || null;
			this.typeParameterSection = templates.typeParameterSection || null;
			this.typeParameter = templates.typeParameter || null;
			this.fieldSection = templates.fieldSection || null;
			this.field = templates.field || null;
			this.propertySection = templates.propertySection || null;
			this.property = templates.property || null;
			this.methodSection = templates.methodSection || null;
			this.method = templates.method || null;
			this.eventSection = templates.eventSection || null;
			this.event = templates.event || null;
			this.instanceFieldSection = templates.instanceFieldSection || this.fieldSection;
			this.instanceField = templates.instanceField || this.field;
			this.instancePropertySection = templates.instancePropertySection || this.propertySection;
			this.instanceProperty = templates.instanceProperty || this.property;
			this.instanceMethodSection = templates.instanceMethodSection || this.methodSection;
			this.instanceMethod = templates.instanceMethod || this.method;
			this.instanceEventSection = templates.instanceEventSection || this.eventSection;
			this.instanceEvent = templates.instanceEvent || this.event;
			this.publicFieldSection = templates.publicFieldSection || this.instanceFieldSection;
			this.publicField = templates.publicField || this.instanceField;
			this.publicPropertySection = templates.publicPropertySection || this.instancePropertySection;
			this.publicProperty = templates.publicProperty || this.instanceProperty;
			this.publicMethodSection = templates.publicMethodSection || this.instanceMethodSection;
			this.publicMethod = templates.publicMethod || this.instanceMethod;
			this.publicEventSection = templates.publicEventSection || this.instanceEventSection;
			this.publicEvent = templates.publicEvent || this.instanceEvent;
			this.protectedFieldSection = templates.protectedFieldSection || this.instanceFieldSection;
			this.protectedField = templates.protectedField || this.instanceField;
			this.protectedPropertySection = templates.protectedPropertySection || this.instancePropertySection;
			this.protectedProperty = templates.protectedProperty || this.instanceProperty;
			this.protectedMethodSection = templates.protectedMethodSection || this.instanceMethodSection;
			this.protectedMethod = templates.protectedMethod || this.instanceMethod;
			this.protectedEventSection = templates.protectedEventSection || this.instanceEventSection;
			this.protectedEvent = templates.protectedEvent || this.instanceEvent;
			this.staticFieldSection = templates.staticFieldSection || this.fieldSection;
			this.staticField = templates.staticField || this.field;
			this.staticPropertySection = templates.staticPropertySection || this.propertySection;
			this.staticProperty = templates.staticProperty || this.property;
			this.staticMethodSection = templates.staticMethodSection || this.methodSection;
			this.staticMethod = templates.staticMethod || this.method;
			this.staticEventSection = templates.staticEventSection || this.eventSection;
			this.staticEvent = templates.staticEvent || this.event;
			this.publicStaticFieldSection = templates.publicStaticFieldSection || templates.staticFieldSection || templates.publicFieldSection || this.fieldSection;
			this.publicStaticField = templates.publicStaticField || templates.staticField || templates.publicField || this.field;
			this.publicStaticPropertySection = templates.publicStaticPropertySection || templates.staticPropertySection || templates.publicPropertySection || this.propertySection;
			this.publicStaticProperty = templates.publicStaticProperty || templates.staticProperty || templates.publicProperty || this.property;
			this.publicStaticMethodSection = templates.publicStaticMethodSection || templates.staticMethodSection || templates.publicMethodSection || this.methodSection;
			this.publicStaticMethod = templates.publicStaticMethod || templates.staticMethod || templates.publicMethod || this.method;
			this.publicStaticEventSection = templates.publicStaticEventSection || templates.staticEventSection || templates.publicEventSection || this.eventSection;
			this.publicStaticEvent = templates.publicStaticEvent || templates.staticEvent || templates.publicEvent || this.event;
			this.protectedStaticFieldSection = templates.protectedStaticFieldSection || templates.staticFieldSection || templates.protectedFieldSection || this.fieldSection;
			this.protectedStaticField = templates.protectedStaticField || templates.staticField || templates.protectedField || this.field;
			this.protectedStaticPropertySection = templates.protectedStaticPropertySection || templates.staticPropertySection || templates.protectedPropertySection || this.propertySection;
			this.protectedStaticProperty = templates.protectedStaticProperty || templates.staticProperty || templates.protectedProperty || this.property;
			this.protectedStaticMethodSection = templates.protectedStaticMethodSection || templates.staticMethodSection || templates.protectedMethodSection || this.methodSection;
			this.protectedStaticMethod = templates.protectedStaticMethod || templates.staticMethod || templates.protectedMethod || this.method;
			this.protectedStaticEventSection = templates.protectedStaticEventSection || templates.staticEventSection || templates.protectedEventSection || this.eventSection;
			this.protectedStaticEvent = templates.protectedStaticEvent || templates.staticEvent || templates.protectedEvent || this.event;
			this.typeSection = templates.typeSection || null;
			this.parameterSection = templates.parameterSection || null;
			this.parameter = templates.parameter || null;
			this.returnSection = templates.returnSection || null;
			this.overloadSection = templates.overloadSection || null;
			this.valueSection = templates.valueSection || null;
			this.value = templates.value || null;

			this.updateMemberSections();
			this.updateMembers();
		}
	}

	/**
	 * Populates the fieldSections, propertySections, methodSections and eventSections properties.
	 * */

	updateMemberSections()
	{
		this.fieldSections = new DocBuilderMemberTemplates({
			all: this.fieldSection,
			instance: this.instanceFieldSection,
			public: this.publicFieldSection,
			protected: this.protectedFieldSection,
			static: this.staticFieldSection,
			publicStatic: this.publicStaticFieldSection,
			protectedStatic: this.protectedStaticFieldSection
		});

		this.propertySections = new DocBuilderMemberTemplates({
			all: this.propertySection,
			instance: this.instancePropertySection,
			public: this.publicPropertySection,
			protected: this.protectedPropertySection,
			static: this.staticPropertySection,
			publicStatic: this.publicStaticPropertySection,
			protectedStatic: this.protectedStaticPropertySection
		});

		this.methodSections = new DocBuilderMemberTemplates({
			all: this.methodSection,
			instance: this.instanceMethodSection,
			public: this.publicMethodSection,
			protected: this.protectedMethodSection,
			static: this.staticMethodSection,
			publicStatic: this.publicStaticMethodSection,
			protectedStatic: this.protectedStaticMethodSection
		});

		this.eventSections = new DocBuilderMemberTemplates({
			all: this.eventSection,
			instance: this.instanceEventSection,
			public: this.publicEventSection,
			protected: this.protectedEventSection,
			static: this.staticEventSection,
			publicStatic: this.publicStaticEventSection,
			protectedStatic: this.protectedStaticEventSection
		});
	}

	/**
	 * Populates the fields, properties, methods and events properties.
	 * */

	updateMembers()
	{
		this.fields = new DocBuilderMemberTemplates({
			all: this.field,
			instance: this.instanceField,
			public: this.publicField,
			protected: this.protectedField,
			static: this.staticField,
			publicStatic: this.publicStaticField,
			protectedStatic: this.protectedStaticField
		});

		this.properties = new DocBuilderMemberTemplates({
			all: this.property,
			instance: this.instanceProperty,
			public: this.publicProperty,
			protected: this.protectedProperty,
			static: this.staticProperty,
			publicStatic: this.publicStaticProperty,
			protectedStatic: this.protectedStaticProperty
		});

		this.methods = new DocBuilderMemberTemplates({
			all: this.method,
			instance: this.instanceMethod,
			public: this.publicMethod,
			protected: this.protectedMethod,
			static: this.staticMethod,
			publicStatic: this.publicStaticMethod,
			protectedStatic: this.protectedStaticMethod
		});

		this.events = new DocBuilderMemberTemplates({
			all: this.event,
			instance: this.instanceEvent,
			public: this.publicEvent,
			protected: this.protectedEvent,
			static: this.staticEvent,
			publicStatic: this.publicStaticEvent,
			protectedStatic: this.protectedStaticEvent
		});
	}

	/**
	 * Create a new DocBuilderTemplates instance using data from a JSON file.
	 * This method loads the JSON file then parses its contents using `DocBuilderTemplates.fromJSON`.
	 * @param {String} filePathName - Path to a JSON file defining the templates.
	 * @returns {DocBuilderTemplates} A DocBuilderTemplates object containing the loaded template data.
	 */

	static fromFile(filePathName)
	{
		let content = fs.readFileSync(filePathName, { encoding: 'UTF-8' });
		let json = JSON.parse(content);

		let path = filePathName.replace(/\/?[^\/]+$/, '');

		// Ensure required properties are present and valid.

		json.api = json.api || {};
		json.api.files = json.api.files || {};
		json.api.path = json.api.path ? json.api.path.replace(/\/+$/, '') : '';// Strip trailing slash if present.

		// Ensure paths are relative to the given JSON file if it's not an absolute path.

		if (json.index.indexOf('/') != 0)
		{
			json.index = path ? path + '/' + json.index : json.index;
		}

		if (json.search.indexOf('/') != 0)
		{
			json.search = path ? path + '/' + json.search : json.search;
		}

		if (json.api.path.indexOf('/') != 0)
		{
			json.api.path = json.api.path ? (path ? path + '/' + json.api.path : json.api.path) : path;
		}

		return DocBuilderTemplates.fromJSON(json);
	}

	/**
	 * Create a new DocBuilderTemplates instance loading template files defined in a JSON object.
	 * @param {Object} json - The JSON object to create the DocBuilderTemplates from.
	 * @param {String} json.index - Path to the index page file template.
	 * @param {String} json.search - Path to the search page file template.
	 * @param {Object} json.api - Object containing templates for API pages.
	 * @param {String} json.api.path - Path where API page template files are located.
	 * @param {Object.<String, String>} json.api.files - Object containing template files for API pages.
	 * @returns {DocBuilderTemplates} A DocBuilderTemplates object containing the loaded template data.
	 */

	static fromJSON(json)
	{
		let templates = {
			index: fs.readFileSync(json.index, { encoding: 'UTF-8' }),
			search: fs.readFileSync(json.search, { encoding: 'UTF-8' })
		};

		let apiPathWithSlash = json.api.path ? json.api.path.replace(/\/+$/, '') + '/' : '';

		for (let name in json.api.files)
		{
			templates[name] = fs.readFileSync(apiPathWithSlash + json.api.files[name], { encoding: 'UTF-8' });
		}

		return new DocBuilderTemplates(templates);
	}

	/** Returns the leading whitespace before a given variable in a given template string. */

	static leadingWhitespace(varName, template)
	{
		let regExp = new RegExp('[\t ]*(?=\\' + varName + ')');
		let match = template.match(regExp);

		return match ? match[0] : '';
	}
}