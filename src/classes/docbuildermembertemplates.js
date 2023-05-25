/**
 * Defines the template HTML markup for members of an object. Used by `DocBuilder`.
 */

export default class DocBuilderMemberTemplates
{
	/** @type {String} Template for all members of an object. */

	all = null;

	/** @type {String} Template for all instance members of an object. */

	instance = null;

	/** @type {String} Template for all public members of an object. */

	public = null;

	/** @type {String} Template for all protected members of an object. */

	protected = null;

	/** @type {String} Template for all static members of an object. */

	static = null;

	/** @type {String} Template for all public static members of an object. */

	publicStatic = null;

	/** @type {String} Template for all protected static members of an object. */

	protectedStatic = null;

	constructor(templates)
	{
		if (templates)
		{
			if (typeof templates == 'string')
			{
				this.all = templates;
				this.instance = templates;
				this.public = templates;
				this.protected = templates;
				this.static = templates;
				this.publicStatic = templates;
				this.protectedStatic = templates;
			}
			else
			{
				this.all = templates.all || null;
				this.instance = templates.instance || this.all;
				this.public = templates.public || this.instance;
				this.protected = templates.protected || this.instance;
				this.static = templates.static || this.all;
				this.publicStatic = templates.publicStatic || templates.static || templates.public || this.all;
				this.protectedStatic = templates.protectedStatic || templates.static || templates.protected || this.all;
			}
		}
	}
}