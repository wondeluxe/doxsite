/**
 * Defines the template HTML markup for object members for a DocBuilder.
 */

export default class DocBuilderMemberTemplates
{
	all = null;
	instance = null;
	public = null;
	protected = null;
	static = null;
	publicStatic = null;
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