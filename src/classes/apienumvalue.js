/**
 * Object representing an enum value.
 */

export default class APIEnumValue
{
	/** Name of the enum value, as accessed from the owning enum. */
	name = null;

	/** Description of the enum value. */
	description = null;

	/** Name of the kind of definition. */
	definitionType = 'enum value';

	/** Unique id assigned to the enum value. */
	id = null;
}