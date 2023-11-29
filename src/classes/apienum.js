/**
 * Object representing an enum.
 */

export default class APIEnum
{
	/** Full qualified name of the enum. */
	qualifiedName = null;

	/** Name of the enum, as accessed from the owning namespace. */
	name = null;

	/** Access modifier of the enum. */
	access = null;

	/** The enum's owning namespace. */
	namespace = null;

	/** Assembly the enum is definied in. */
	assembly = null;

	/** Brief description of the method. */
	shortDescription = null;

	/** Detailed description of the method. */
	description = null;

	/** Values defined by the enum. */
	values = [];

	/** Name of the kind of definition. */
	definitionType = 'enum';

	/** Reference to the class, struct or interface in which the enum was defined. */
	owner = null;

	/** Unique id assigned to the enum. */
	id = null;
}