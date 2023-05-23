import DocBuilderMemberTemplates from './docbuildermembertemplates.js';
import shell from 'shelljs';

/**
 * Defines the template HTML markup for a DocBuilder.
 */

export default class DocBuilderTemplates
{
	/** Main page template that all pages are constructed from. */

	page = null;

	/** Markup for type/member declarations. */

	memberDeclaration = null;

	/** Markup for type inheritance. */

	memberInherits = null;

	/** Markup for interfaces implemented by a type. */

	memberImplements = null;

	/** Markup for the listed item's namespace. */

	memberNamespace = null;

	/** Markup for the listed item's assembly. */

	memberAssembly = null;

	/** Markup for a namespace that appears in the nav menu on a page. */

	navNamespace = null;

	/** Markup for an item (class/struct/enum etc.) that is listed in the nav menu under a namespace. */

	navMember = null;

	/** Markup for the description section of a page. */

	descriptionSection = null;

	/** Markup for the section of a page that documents an item's type/template parameters. */

	typeParameterSection = null;

	/** Markup for a documented type/template parameter. */

	typeParameter = null;

	/** Markup for the section of a page that documents an item's fields. */

	fieldSection = null;

	/** Markup for a documented field. */

	field = null;

	/** Markup for the section of a page that documents an item's properties. */

	propertySection = null;

	/** Markup for a documented property. */

	property = null;

	/** Markup for the section of a page that documents an item's methods. */

	methodSection = null;

	/** Markup for a documented method. */

	method = null;

	/** Markup for the section of a page that documents an item's events. */

	eventSection = null;

	/** Markup for a documented event. */

	event = null;

	/** Markup for the section of a page that documents an item's instance/non-static fields. */

	instanceFieldSection = null;

	/** Markup for a documented instance/non-static field. */

	instanceField = null;

	/** Markup for the section of a page that documents an item's instance/non-static properties. */

	instancePropertySection = null;

	/** Markup for a documented instance/non-static property. */

	instanceProperty = null;

	/** Markup for the section of a page that documents an item's instance/non-static methods. */

	instanceMethodSection = null;

	/** Markup for a documented instance/non-static method. */

	instanceMethod = null;

	/** Markup for the section of a page that documents an item's instance/non-static events. */

	instanceEventSection = null;

	/** Markup for a documented instance/non-static event. */

	instanceEvent = null;

	/** Markup for the section of a page that documents an item's public fields. */

	publicFieldSection = null;

	/** Markup for a documented public field. */

	publicField = null;

	/** Markup for the section of a page that documents an item's public properties. */

	publicPropertySection = null;

	/** Markup for a documented public property. */

	publicProperty = null;

	/** Markup for the section of a page that documents an item's public methods. */

	publicMethodSection = null;

	/** Markup for a documented public method. */

	publicMethod = null;

	/** Markup for the section of a page that documents an item's public events. */

	publicEventSection = null;

	/** Markup for a documented public event. */

	publicEvent = null;

	/** Markup for the section of a page that documents an item's protected fields. */

	protectedFieldSection = null;

	/** Markup for a documented protected field. */

	protectedField = null;

	/** Markup for the section of a page that documents an item's protected properties. */

	protectedPropertySection = null;

	/** Markup for a documented protected property. */

	protectedProperty = null;

	/** Markup for the section of a page that documents an item's protected methods. */

	protectedMethodSection = null;

	/** Markup for a documented protected method. */

	protectedMethod = null;

	/** Markup for the section of a page that documents an item's protected events. */

	protectedEventSection = null;

	/** Markup for a documented protected method. */

	protectedEvent = null;

	/** Markup for the section of a page that documents an item's static fields. */

	staticFieldSection = null;

	/** Markup for a documented static field. */

	staticField = null;

	/** Markup for the section of a page that documents an item's static properties. */

	staticPropertySection = null;

	/** Markup for a documented static property. */

	staticProperty = null;

	/** Markup for the section of a page that documents an item's static methods. */

	staticMethodSection = null;

	/** Markup for a documented static method. */

	staticMethod = null;

	/** Markup for the section of a page that documents an item's static events. */

	staticEventSection = null;

	/** Markup for a documented static event. */

	staticEvent = null;

	/** Markup for the section of a page that documents an item's public static fields. */

	publicStaticFieldSection = null;

	/** Markup for a documented public static field. */

	publicStaticField = null;

	/** Markup for the section of a page that documents an item's public static properties. */

	publicStaticPropertySection = null;

	/** Markup for a documented public static property. */

	publicStaticProperty = null;

	/** Markup for the section of a page that documents an item's public static methods. */

	publicStaticMethodSection = null;
	
	/** Markup for a documented public static method. */

	publicStaticMethod = null;

	/** Markup for the section of a page that documents an item's public static events. */

	publicStaticEventSection = null;

	/** Markup for a documented public static event. */

	publicStaticEvent = null;

	/** Markup for the section of a page that documents an item's protected static fields. */

	protectedStaticFieldSection = null;

	/** Markup for a documented protected static field. */

	protectedStaticField = null;

	/** Markup for the section of a page that documents an item's protected static properties. */

	protectedStaticPropertySection = null;

	/** Markup for a documented protected static property. */

	protectedStaticProperty = null;
	/** Markup for the section of a page that documents an item's protected static methods. */

	protectedStaticMethodSection = null;

	/** Markup for a documented protected static method. */

	protectedStaticMethod = null;

	/** Markup for the section of a page that documents an item's protected static events. */

	protectedStaticEventSection = null;

	/** Markup for a documented protected static event. */

	protectedStaticEvent = null;

	/** Markup for the section of a field or property page's that documents its type. */

	typeSection = null;

	/** Markup for the section of a method's page that documents its parameters. */

	parameterSection = null;

	/** Markup for a documented method parameter. */

	parameter = null;

	/** Markup for the section of a method's page that documents its return value. */

	returnSection = null;

	/** Markup for the section of a method's page that documents its overloards. */

	overloadSection = null;

	/** Markup for the section of an enum's page that documents its values. */

	valueSection = null;

	/** Markup for a documented enum value. */

	value = null;

	/**
	 * Object populated in updateMemberSections that contains all templates for all field sections:
	 * all: this.fieldSection,
	 * instance: this.instanceFieldSection,
	 * public: this.publicFieldSection,
	 * protected: this.protectedFieldSection,
	 * static: this.staticFieldSection,
	 * publicStatic: this.publicStaticFieldSection,
	 * protectedStatic: this.protectedStaticFieldSection
	 */

	fieldSections = null;

	/**
	 * Object populated in updateMemberSections that contains all templates for all property sections:
	 * all: this.propertySection,
	 * instance: this.instancePropertySection,
	 * public: this.publicPropertySection,
	 * protected: this.protectedPropertySection,
	 * static: this.staticPropertySection,
	 * publicStatic: this.publicStaticPropertySection,
	 * protectedStatic: this.protectedStaticPropertySection
	 */

	propertySections = null;

	/**
	 * Object populated in updateMemberSections that contains all templates for all method sections:
	 * all: this.methodSection,
	 * instance: this.instanceMethodSection,
	 * public: this.publicMethodSection,
	 * protected: this.protectedMethodSection,
	 * static: this.staticMethodSection,
	 * publicStatic: this.publicStaticMethodSection,
	 * protectedStatic: this.protectedStaticMethodSection
	 */

	methodSections = null;

	/**
	 * Object populated in updateMemberSections that contains all templates for event sections:
	 * all: this.eventSection,
	 * instance: this.instanceEventSection,
	 * public: this.publicEventSection,
	 * protected: this.protectedEventSection,
	 * static: this.staticEventSection,
	 * publicStatic: this.publicStaticEventSection,
	 * protectedStatic: this.protectedStaticEventSection
	 */

	eventSections = null;

	/**
	 * Object populated in updateMembers that contains all templates for all fields:
	 * all: this.field,
	 * instance: this.instanceField,
	 * public: this.publicField,
	 * protected: this.protectedField,
	 * static: this.staticField,
	 * publicStatic: this.publicStaticField,
	 * protectedStatic: this.protectedStaticField
	 */

	fields = null;

	/**
	 * Object populated in updateMembers that contains all templates for all properties:
	 * all: this.property,
	 * instance: this.instanceProperty,
	 * public: this.publicProperty,
	 * protected: this.protectedProperty,
	 * static: this.staticProperty,
	 * publicStatic: this.publicStaticProperty,
	 * protectedStatic: this.protectedStaticProperty
	 */

	properties = null;

	/**
	 * Object populated in updateMembers that contains all templates for all methods:
	 * all: this.method,
	 * instance: this.instanceMethod,
	 * public: this.publicMethod,
	 * protected: this.protectedMethod,
	 * static: this.staticMethod,
	 * publicStatic: this.publicStaticMethod,
	 * protectedStatic: this.protectedStaticMethod
	 */

	methods = null;

	/**
	 * Object populated in updateMembers that contains all templates for all events:
	 * all: this.event,
	 * instance: this.instanceEvent,
	 * public: this.publicEvent,
	 * protected: this.protectedEvent,
	 * static: this.staticEvent,
	 * publicStatic: this.publicStaticEvent,
	 * protectedStatic: this.protectedStaticEvent
	 */

	events = null;

	constructor(templates)
	{
		if (templates)
		{
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

	/** Populates the fieldSections, propertySections, methodSections and eventSections properties. */

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

	/** Populates the fields, properties, methods and events properties. */

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

	/** Creates a new DocBuilderTemplates object from the contents of given files. */

	static fromFiles(filePath, fileNames)
	{
		let templates = {};

		for (let templateName in fileNames)
		{
			templates[templateName] = shell.cat(filePath + '/' + fileNames[templateName]);
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