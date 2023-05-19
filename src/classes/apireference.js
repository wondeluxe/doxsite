/**
 * Object containing a reference to an API entity.
 */

export default class APIReference
{
	/** Full qualified name of the field. */
	qualifiedName = null;

	/** Name of the field, as accessed from the owning Type. */
	name = null;

	/** Unique id of the referenced entity. */
	id = null;
}