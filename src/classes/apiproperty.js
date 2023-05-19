/**
 * Object representing a property for a class or struct.
 */

export default class APIProperty
{
	/** Full qualified name of the property. */
	qualifiedName = null;

	/** Name of the property, as accessed from the owning Type. */
	name = null;

	/** The property's Type. */
	type = null;

	/** Access modifier of the property. Reflects the getter's access modifier. */
	access = null;

	/** Access modifier of the property's getter. */
	getAccess = null;

	/** Access modifier of the property's setter. */
	setAccess = null;

	/** Is the property static? */
	static = false;

	// TODO
	// modifiers = [];

	/** The property's owning namespace. */
	namespace = null;

	/** Assembly the property is definied in. */
	assembly = null;

	/** Brief description of the property. */
	shortDescription = null;

	/** Detailed description of the property. */
	description = null;

	/** Name of the kind of definition. */
	definitionType = 'property';

	/** Unique id assigned to the property. */
	id = null;
}