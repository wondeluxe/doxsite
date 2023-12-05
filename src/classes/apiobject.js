/**
 * @typedef {APIObject|APIField|APIProperty|APIMethod|APIEvent|APIEnum} APIMember
 */

/**
 * Object representing a class, struct or interface.
 */

export default class APIObject
{
	/**
	 * Full qualified name of the class, struct or interface.
	 * @type String
	 */

	qualifiedName = null;

	/**
	 * Name of the class, struct or interface, as accessed from the owning namespace.
	 * @type String
	 */

	name = null;

	/**
	 * Template types used by the class, struct or interface.
	 * @type APITemplateType[]
	 */

	types = [];

	/**
	 * Access modifier of the class, struct or interface.
	 * @type String
	 */

	access = null;

	/**
	 * Types the class, struct or interface directly inherits from.
	 * @type APIReference[]
	 */

	inherits = [];

	/**
	 * Interfaces the class, struct or interface directly implements.
	 * @type APIReference[]
	 */
	implements = [];

	/**
	 * The class, struct or interface's owning namespace.
	 * @type String
	 */

	namespace = null;

	/**
	 * Assembly the class, struct or interface is definied in.
	 * @type String
	 */

	assembly = null;

	/**
	 * Brief description of the class, struct or interface.
	 * @type String
	 */

	shortDescription = null;

	/**
	 * Detailed description of the class, struct or interface.
	 * @type String
	 */

	description = null;

	/**
	 * Fields, properties, methods and events definied by the class, struct or interface.
	 * @type APIMember[]
	 */

	members = [];

	/**
	 * Name of the kind of definition (class, struct or interface).
	 * @type String
	 */

	definitionType = null;

	/**
	 * Reference to the class, struct or interface in which this class, struct or interface was defined.
	 * @type APIReference
	 */

	owner = null;

	/**
	 * Unique id assigned to the class, struct or interface.
	 * @type String
	 */

	id = null;
}