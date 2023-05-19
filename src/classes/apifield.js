/**
 * Object representing a field of a class or struct.
 */

export default class APIField
{
	/** Full qualified name of the field. */
	qualifiedName = null;

	/** Name of the field, as accessed from the owning Type. */
	name = null;

	/** The field's Type. */
	type = null;

	/** Access modifier of the field. */
	access = null;

	/** Is the field static? */
	static = false;

	// TODO
	// modifiers = [];

	/** The field's owning namespace. */
	namespace = null;

	/** Assembly the field is definied in. */
	assembly = null;

	/** Brief description of the field. */
	shortDescription = null;

	/** Detailed description of the field. */
	description = null;

	/** Name of the kind of definition. */
	definitionType = 'field';

	/** Unique id assigned to the field. */
	id = null;
}