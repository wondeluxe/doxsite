/**
 * Object representing a namespace.
 */

export default class APINamespace
{
	/** Full qualified name of the namespace. */
	qualifiedName = null;

	/** Name of the namespace, as accessed from the owning namespace. */
	name = null;

	/** Members defined by the namespace. */
	members = [];

	/** Name of the kind of definition. */
	definitionType = 'namespace';

	/**
	 * Sorts the members of a namespace alphabetically by name.
	 * @param {APINamespace} namespace The namespace whose members to sort.
	 */

	static sortMembers(namespace)
	{
		namespace.members.sort((memberA, memberB) => {
			return memberA.name.localeCompare(memberB.name);
		});
	}
}