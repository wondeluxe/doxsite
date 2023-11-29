/**
 * Object representing a class, struct or interface.
 */

export default class APIObject
{
	/** Full qualified name of the class, struct or interface. */
	qualifiedName = null;

	/** Name of the class, struct or interface, as accessed from the owning namespace. */
	name = null;

	/** Template types used by the class, struct or interface. */
	types = [];

	/** Access modifier of the class, struct or interface. */
	access = null;

	/** Types the class, struct or interface directly inherits from. */
	inherits = [];

	/** Interfaces the class, struct or interface directly implements. */
	implements = [];

	/** The class, struct or interface's owning namespace. */
	namespace = null;

	/** Assembly the class, struct or interface is definied in. */
	assembly = null;

	/** Brief description of the class, struct or interface. */
	shortDescription = null;

	/** Detailed description of the class, struct or interface. */
	description = null;

	/** Fields, properties, methods and events definied by the class, struct or interface. */
	members = [];

	/** Name of the kind of definition (class, struct or interface). */
	definitionType = null;

	/** Reference to the class, struct or interface in which this class, struct or interface was defined. */
	owner = null;

	/** Unique id assigned to the class, struct or interface. */
	id = null;
}