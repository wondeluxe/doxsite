/**
 * Object representing a method of a class or struct.
 */

export default class APIMethod
{
	/** Full qualified name of the method. */
	qualifiedName = null;

	/** Name of the method, as accessed from the owning Type. */
	name = null;

	/** Return type of the method. */
	type = null;

	/** Template types used by the method. */
	types = [];

	/** Parameters of the method. */
	params = [];

	/** Access modifier of the method. */
	access = null;

	/** Is the method static? */
	static = false;

	/** Is the method a delegate? */
	delegate = false;

	// TODO
	// modifiers = [];

	/** The method's owning namespace. */
	namespace = null;

	/** Assembly method is definied in. */
	assembly = null;

	/** Brief description of the method. */
	shortDescription = null;

	/** Detailed description of the method. */
	description = null;

	/** Description of the method's return value. */
	returnsDescription = null;

	/** References to overloads of the method. */
	overloads = [];

	/** Name of the kind of definition. */
	definitionType = 'method';

	/** Reference to the class, struct or interface in which the method was defined. */
	owner = null;

	/** Unique id assigned to the method. */
	id = null;
}