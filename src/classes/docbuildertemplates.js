import DocBuilderMemberTemplates from './docbuildermembertemplates.js';
import shell from 'shelljs';

/**
 * Defines the template HTML markup for a DocBuilder.
 */

export default class DocBuilderTemplates
{
	page = null;
	memberDeclaration = null;
	memberInherits = null;
	memberImplements = null;
	memberNamespace = null;
	memberAssembly = null;
	navNamespace = null;
	navMember = null;
	descriptionSection = null;
	typeParameterSection = null;
	typeParameter = null;
	fieldSection = null;
	field = null;
	propertySection = null;
	property = null;
	methodSection = null;
	method = null;
	eventSection = null;
	event = null;
	instanceFieldSection = null;
	instanceField = null;
	instancePropertySection = null;
	instanceProperty = null;
	instanceMethodSection = null;
	instanceMethod = null;
	instanceEventSection = null;
	instanceEvent = null;
	publicFieldSection = null;
	publicField = null;
	publicPropertySection = null;
	publicProperty = null;
	publicMethodSection = null;
	publicMethod = null;
	publicEventSection = null;
	publicEvent = null;
	protectedFieldSection = null;
	protectedField = null;
	protectedPropertySection = null;
	protectedProperty = null;
	protectedMethodSection = null;
	protectedMethod = null;
	protectedEventSection = null;
	protectedEvent = null;
	staticFieldSection = null;
	staticField = null;
	staticPropertySection = null;
	staticProperty = null;
	staticMethodSection = null;
	staticMethod = null;
	staticEventSection = null;
	staticEvent = null;
	publicStaticFieldSection = null;
	publicStaticField = null;
	publicStaticPropertySection = null;
	publicStaticProperty = null;
	publicStaticMethodSection = null;
	publicStaticMethod = null;
	publicStaticEventSection = null;
	publicStaticEvent = null;
	protectedStaticFieldSection = null;
	protectedStaticField = null;
	protectedStaticPropertySection = null;
	protectedStaticProperty = null;
	protectedStaticMethodSection = null;
	protectedStaticMethod = null;
	protectedStaticEventSection = null;
	protectedStaticEvent = null;
	typeSection = null;
	parameterSection = null;
	parameter = null;
	returnSection = null;
	overloadSection = null;
	valueSection = null;

	fieldSections = null;
	propertySections = null;
	methodSections = null;
	eventSections = null;

	fields = null;
	properties = null;
	methods = null;
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

	static fromFiles(filePath, fileNames)
	{
		let templates = {};

		for (let templateName in fileNames)
		{
			templates[templateName] = shell.cat(filePath + '/' + fileNames[templateName]);
		}

		return new DocBuilderTemplates(templates);
	}

	static leadingWhitespace(varName, template)
	{
		let regExp = new RegExp('[\t ]*(?=\\' + varName + ')');
		let match = template.match(regExp);

		return match ? match[0] : '';
	}
}