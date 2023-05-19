/**
 * Object representing a parameter of a method or delegate.
 */

export default class APIParameter
{
	/** Name of the parameter. */
	name = null;

	/** The parameter's Type. */
	type = null;

	/** Default value of the parameter. */
	defaultValue = null;

	/** Description of the parameter. */
	description = null;

	/** Name of the kind of definition. */
	definitionType = 'parameter';
}