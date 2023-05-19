/**
 * Object representing an event.
 */

export default class APIEvent
{
	/** Full qualified name of the event. */
	qualifiedName = null;

	/** Name of the event, as accessed from the owning Type. */
	name = null;

	/** The event's Type. */
	type = null;

	/** Access modifier of the event. */
	access = null;

	/** Is the event static? */
	static = false;

	// TODO
	// modifiers = [];

	/** The event's owning namespace. */
	namespace = null;

	/** Assembly the event is definied in. */
	assembly = null;

	/** Brief description of the event. */
	shortDescription = null;

	/** Detailed description of the event. */
	description = null;

	/** Name of the kind of definition. */
	definitionType = 'event';

	/** Unique id assigned to the event. */
	id = null;
}