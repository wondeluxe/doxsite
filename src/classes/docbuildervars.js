/**
 * Defines the variable names used in html templates used by DocBuilder.
 */

export default class DocBuilderVars
{
	static ROOT_PATH = '$rootpath';
	static NAV_SECTION = '$navsection';
	static NAV_NAMESPACE = '$navnamespace';
	static NAV_MEMBERS = '$navmembers';
	static NAV_MEMBER_NAME = '$navmembername';
	static NAV_MEMBER_URL = '$navmemberurl';
	static MEMBER_NAME = '$membername';
	static MEMBER_NAME_TEXT = '$membernametext';
	static MEMBER_TYPE_TEXT = '$membertypetext';
	static MEMBER_TYPE_TITLE_TEXT = '$membertypetitletext';
	static MEMBER_DECLARATION = '$memberdeclaration';
	static MEMBER_INHERITS = '$memberinherits';
	static MEMBER_IMPLEMENTS = '$memberimplements';
	static MEMBER_NAMESPACE = '$membernamespace';
	static MEMBER_ASSEMBLY = '$memberassembly';
	static MEMBER_OWNER = '$memberowner';
	static MEMBER_OWNER_NAME = '$memberownername';
	static DESCRIPTION_SECTION = '$descriptionsection';
	static TYPE_PARAMETER_SECTION = '$typeparametersection';
	static TYPE_PARAMETERS = '$typeparameters';
	static TYPE_PARAMETER_NAME = '$typeparametername';
	static TYPE_PARAMETER_DESCRIPTION = '$typeparameterdescription';
	static ACCESS_TEXT = '$accesstext';
	static ACCESS_TITLE_TEXT = '$accesstitletext';
	static FIELD_SECTION = '$fieldsection';
	static FIELDS = '$fields';
	static FIELD_TYPE = '$fieldtype';
	static FIELD_NAME = '$fieldname';
	static FIELD_DESCRIPTION = '$fielddescription';
	static PROPERTY_SECTION = '$propertysection';
	static PROPERTIES = '$properties';
	static PROPERTY_TYPE = '$propertytype';
	static PROPERTY_NAME = '$propertyname';
	static PROPERTY_ACCESSORS = '$propertyaccessors';
	static PROPERTY_DESCRIPTION = '$propertydescription';
	static METHOD_SECTION = '$methodsection';
	static METHODS = '$methods';
	static METHOD_TYPE = '$methodtype';
	static METHOD_NAME = '$methodname';
	static METHOD_PARAMETERS = '$methodparameters';
	static METHOD_DESCRIPTION = '$methoddescription';
	static EVENT_SECTION = '$eventsection';
	static EVENTS = '$events';
	static EVENT_TYPE = '$eventtype';
	static EVENT_NAME = '$eventname';
	static EVENT_DESCRIPTION = '$eventdescription';
	static INSTANCE_FIELD_SECTION = '$instancefieldsection';
	static INSTANCE_PROPERTY_SECTION = '$instancepropertysection';
	static INSTANCE_METHOD_SECTION = '$instancemethodsection';
	static INSTANCE_EVENT_SECTION = '$instanceeventsection';
	static PUBLIC_FIELD_SECTION = '$publicfieldsection';
	static PUBLIC_PROPERTY_SECTION = '$publicpropertysection';
	static PUBLIC_METHOD_SECTION = '$publicmethodsection';
	static PUBLIC_EVENT_SECTION = '$publiceventsection';
	static PROTECTED_FIELD_SECTION = '$protectedfieldsection';
	static PROTECTED_PROPERTY_SECTION = '$protectedpropertysection';
	static PROTECTED_METHOD_SECTION = '$protectedmethodsection';
	static PROTECTED_EVENT_SECTION = '$protectedeventsection';
	static STATIC_FIELD_SECTION = '$staticfieldsection';
	static STATIC_PROPERTY_SECTION = '$staticpropertysection';
	static STATIC_METHOD_SECTION = '$staticmethodsection';
	static STATIC_EVENT_SECTION = '$staticeventsection';
	static PUBLIC_STATIC_FIELD_SECTION = '$publicstaticfieldsection';
	static PUBLIC_STATIC_PROPERTY_SECTION = '$publicstaticpropertysection';
	static PUBLIC_STATIC_METHOD_SECTION = '$publicstaticmethodsection';
	static PUBLIC_STATIC_EVENT_SECTION = '$publicstaticeventsection';
	static PROTECTED_STATIC_FIELD_SECTION = '$protectedstaticfieldsection';
	static PROTECTED_STATIC_PROPERTY_SECTION = '$protectedstaticpropertysection';
	static PROTECTED_STATIC_METHOD_SECTION = '$protectedstaticmethodsection';
	static PROTECTED_STATIC_EVENT_SECTION = '$protectedstaticeventsection';
	static TYPE_SECTION = '$typesection';
	static TYPE = '$type';
	static PARAMETER_SECTION = '$parametersection';
	static PARAMETERS = '$parameters';
	static PARAMETER_TYPE = '$parametertype';
	static PARAMETER_NAME = '$parametername';
	static PARAMETER_DESCRIPTION = '$parameterdescription';
	static RETURN_SECTION = '$returnsection';
	static RETURN_TYPE = '$returntype';
	static RETURN_DESCRIPTION = '$returndescription';
	static OVERLOAD_SECTION = '$overloadsection';
	static VALUE_SECTION = '$valuesection';
	static VALUES = '$values';
	static VALUE_NAME = '$valuename';
	static VALUE_DESCRIPTION = '$valuedescription';

	static regExp(varName, includeLeadingWhitespace = false)
	{
		if (includeLeadingWhitespace)
		{
			return new RegExp('\s*\\' + varName + '(?![a-z])', 'g');
		}

		return new RegExp('\\' + varName + '(?![a-z])', 'g');
	}
}