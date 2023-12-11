# **doxsite**

Utility for creating highly customised documentation websites with XML generated by Doxygen.

This package has been created with C# projects in mind. Doxygen is capable of producing data for a number of programming languages, however this package has not been tested with data from projects other than C#.

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
	1. [Create a new project](#1-create-a-new-project)
	1. [Modify Doxygen input](#2-modify-doxygen-input)
	1. [Run Doxygen](#3-run-doxygen)
	1. [Run doxsite](#4-run-doxsite)
- [Site customisation](#site-customisation)
	- [templates.json](#templatesjson)
	- [HTML templates](#html-templates)
	- [Template variables](#template-variables)
- [Manual](#manual)
	- [CLI](#cli)
	- [JavaScript](#javascript)
- [Support](#support)

## **Requirements**

This package uses XML output from [Doxygen](https://www.doxygen.nl/index.html) to generate a documentation website for annotated C# code. See the [Getting started](https://www.doxygen.nl/manual/starting.html) page on the Doxygen website for details on installing and running Doxygen.

It is worth noting that only the XML output is required to use the doxsite package, so all other forms of output can be ignored.

## **Installation**

It is recommended to install doxsite globally, so as to get access to the command line interface (CLI). The CLI will make creating new projects easier as well as give you the option to forego additional node scripts for building your documentation site.

To install globally:

```
$ npm install -g doxsite
```

If you would like to use the package in your node scripts after installing globally, you will need to link doxsite to your local project:

```
$ npm link doxsite
```


## **Getting started**

### **1. Create a new project**

The easiest way to get started is to use the command line interface to set up a default project. `cd` into the folder you wish to create your documentation in and run:

```
$ doxsite -n
```

This command will create the following folders/files:

| Folder/File                       | Description |
| --------------------------------- | ----------- |
| develop                           | Root folder for the documentation website's development. |
| develop/API                       | Output folder for documentation pages. |
| develop/scripts/nav.js            | Script responsible for nav tree functionality on each page of the site. Handles expand/collapse of namespaces and resizing of the nav tree column. |
| develop/styles/documentation.css  | Stylesheet for the website. |
| doxygen                           | Folder containing Doxygen related files. |
| doxygen/Doxyfile                  | The config file to use when running Doxygen. You will need to modify the `INPUT` option to point to your project. All other options will be configured to work with this folder/file structure. |
| doxygen/XML                       | Output directory for XML produced by Doxygen. Doxyfile points to this folder. |
| templates                         | Folder containing html templates to build the documentation pages with. |
| templates/tempaltes.json          | Template config file. Defines which html files to use for each section/element of a documentation page. |

### **2. Modify Doxygen input**

Next modify the `INPUT` option in the Doxyfile to point to the folders you want to generate documentation for. You can enter multiple paths separated by spaces, eg:

```
INPUT = "../Project/Company/Scripts" "../Project/Project/Scripts" "../Project/Some Other/Scripts"
```

By default the Doxyfile will have the `RECURSIVE` option set to `YES` so all sub folders will be traversed when Doxygen runs.

### **3. Run Doxygen**

If Doxygen is installed on the command line, run the following command:

```
$ doxygen doxygen/Doxyfile
```

The **doxygen/XML** folder will now contain the data needed by doxsite.

### **4. Run doxsite**

To run doxsite from the command line:

```
$ doxsite -x doxygen/XML -t templates/templates.json -o develop -a API
```

Or from a Node script:

```js
import { Doxsite } from 'doxsite';

Doxsite.buildDocs({
	xmlPath: 'doxygen/XML',
	templates: 'templates/templates.json',
	outputPath: 'develop',
	apiSubPath: 'API',
	searchdataSubPath: 'scripts'
});
```

## **Site customisation**

doxsite generates a website by parsing the XML output of Doxygen and injecting that data into HTML templates. The templates use predefined variables (in the format `$variablename`) where content generated by doxsite should be inserted. This gives you near total control of the layout, styling and scripts used on each page.

### **templates.json**

The easiest way to supply template data is using a **templates.json** file that defines which files/content to use for each template. The default project created using `doxsite -n` provides a file that can be used as a reference under `templates/templates.json`.

A templates .json file should contain two root level properties:

| Property | Type   | Description |
| -------- | ------ | ----------- |
| filePath | String | Path where templates files are located, relative to this json file. |
| files    | Object | Object where each property is the name of a template, and its value is the name of a file whose content to use. |

### **HTML templates**

The following table lists all valid template properties that can be provided in templates.json.

| Template                       | Description |
| ------------------------------ | ----------- |
| page                           | The default template that all documentation pages are constructed from (the layout template for a page). |
| memberDeclaration              | Markup for type/member declarations. |
| memberInherits                 | Markup for listed type inheritance. |
| memberImplements               | Markup for interfaces implemented by a type. |
| memberNamespace                | Markup for the listed item's namespace. |
| memberAssembly                 | Markup for the listed item's assembly. |
| navNamespace                   | Markup for a namespace that appears in the nav tree on a page. |
| navMember                      | Markup for an item (class/struct/enum etc.) that is listed in the nav tree under a namespace. |
| navMemberThis                  | Markup for an item (class/struct/enum etc.) that is listed in the nav menu whose page it is. |
| navMemberMember                | Markup for an item (class/struct/enum etc.) that is listed in the nav menu whose member's page it is. |
| descriptionSection             | Markup for the description section of a page. |
| typeParameterSection           | Markup for the section of a page that documents an item's type/template parameters. |
| typeParameter                  | Markup for a documented type/template parameter. |
| fieldSection                   | Markup for the section of a page that documents an item's fields. |
| field                          | Markup for a documented field. |
| propertySection                | Markup for the section of a page that documents an item's properties. |
| property                       | Markup for a documented property. |
| methodSection                  | Markup for the section of a page that documents an item's methods. |
| method                         | Markup for a documented method. |
| eventSection                   | Markup for the section of a page that documents an item's events. |
| event                          | Markup for a documented event. |
| instanceFieldSection           | Markup for the section of a page that documents an item's instance/non-static fields. If not supplied, the content of **fieldSection** is used instead. |
| instanceField                  | Markup for a documented instance/non-static field. |
| instancePropertySection        | Markup for the section of a page that documents an item's instance/non-static properties. If not supplied, the content of **propertySection** is used instead. |
| instanceProperty               | Markup for a documented instance/non-static property. |
| instanceMethodSection          | Markup for the section of a page that documents an item's instance/non-static methods. If not supplied, the content of **methodSection** is used instead. |
| instanceMethod                 | Markup for a documented instance/non-static method. |
| instanceEventSection           | Markup for the section of a page that documents an item's instance/non-static events. If not supplied, the content of **eventSection** is used instead. |
| instanceEvent                  | Markup for a documented instance/non-static event. |
| publicFieldSection             | Markup for the section of a page that documents an item's public fields. If not supplied, the content of **fieldSection** is used instead. |
| publicField                    | Markup for a documented public field. |
| publicPropertySection          | Markup for the section of a page that documents an item's public properties. If not supplied, the content of **propertySection** is used instead. |
| publicProperty                 | Markup for a documented public property. |
| publicMethodSection            | Markup for the section of a page that documents an item's public methods. If not supplied, the content of **methodSection** is used instead. |
| publicMethod                   | Markup for a documented public method. |
| publicEventSection             | Markup for the section of a page that documents an item's public events. If not supplied, the content of **eventSection** is used instead. |
| publicEvent                    | Markup for a documented public event. |
| protectedFieldSection          | Markup for the section of a page that documents an item's protected fields. If not supplied, the content of **fieldSection** is used instead. |
| protectedField                 | Markup for a documented protected field. |
| protectedPropertySection       | Markup for the section of a page that documents an item's protected properties. If not supplied, the content of **propertySection** is used instead. |
| protectedProperty              | Markup for a documented protected property. |
| protectedMethodSection         | Markup for the section of a page that documents an item's protected methods. If not supplied, the content of **methodSection** is used instead. |
| protectedMethod                | Markup for a documented protected method. |
| protectedEventSection          | Markup for the section of a page that documents an item's protected events. If not supplied, the content of **eventSection** is used instead. |
| protectedEvent                 | Markup for a documented protected method. |
| staticFieldSection             | Markup for the section of a page that documents an item's static fields. If not supplied, the content of **fieldSection** is used instead. |
| staticField                    | Markup for a documented static field. |
| staticPropertySection          | Markup for the section of a page that documents an item's static properties. If not supplied, the content of **propertySection** is used instead. |
| staticProperty                 | Markup for a documented static property. |
| staticMethodSection            | Markup for the section of a page that documents an item's static methods. If not supplied, the content of **methodSection** is used instead. |
| staticMethod                   | Markup for a documented static method. |
| staticEventSection             | Markup for the section of a page that documents an item's static events. If not supplied, the content of **eventSection** is used instead. |
| staticEvent                    | Markup for a documented static event. |
| publicStaticFieldSection       | Markup for the section of a page that documents an item's public static fields. If not supplied, the content of **staticFieldSection**, **publicFieldSection** or **fieldSection** will be used (in that order, first that contains content). |
| publicStaticField              | Markup for a documented public static field. |
| publicStaticPropertySection    | Markup for the section of a page that documents an item's public static properties. If not supplied, the content of **staticPropertySection**, **publicPropertySection** or **propertySection** will be used (in that order, first that contains content). |
| publicStaticProperty           | Markup for a documented public static property. |
| publicStaticMethodSection      | Markup for the section of a page that documents an item's public static methods. If not supplied, the content of **staticMethodSection**, **publicMethodSection** or **methodSection** will be used (in that order, first that contains content). |
| publicStaticMethod             | Markup for a documented public static method. |
| publicStaticEventSection       | Markup for the section of a page that documents an item's public static events. If not supplied, the content of **staticEventSection**, **publicEventSection** or **eventSection** will be used (in that order, first that contains content). |
| publicStaticEvent              | Markup for a documented public static event. |
| protectedStaticFieldSection    | Markup for the section of a page that documents an item's protected static fields. If not supplied, the content of **staticFieldSection**, **protectedFieldSection** or **fieldSection** will be used (in that order, first that contains content). |
| protectedStaticField           | Markup for a documented protected static field. |
| protectedStaticPropertySection | Markup for the section of a page that documents an item's protected static properties. If not supplied, the content of **staticPropertySection**, **protectedPropertySection** or **propertySection** will be used (in that order, first that contains content). |
| protectedStaticProperty        | Markup for a documented protected static property. |
| protectedStaticMethodSection   | Markup for the section of a page that documents an item's protected static methods. If not supplied, the content of **staticMethodSection**, **protectedMethodSection** or **methodSection** will be used (in that order, first that contains content). |
| protectedStaticMethod          | Markup for a documented protected static method. |
| protectedStaticEventSection    | Markup for the section of a page that documents an item's protected static events. If not supplied, the content of **staticEventSection**, **protectedEventSection** or **eventSection** will be used (in that order, first that contains content). |
| protectedStaticEvent           | Markup for a documented protected static event. |
| typeSection                    | Markup for the section of a field or property page's that documents its type. |
| parameterSection               | Markup for the section of a method's page that documents its parameters. |
| parameter                      | Markup for a documented method parameter. |
| returnSection                  | Markup for the section of a method's page that documents its return value. |
| overloadSection                | Markup for the section of a method's page that documents its overloards. |
| valueSection                   | Markup for the section of an enum's page that documents its values. |
| value                          | Markup for a documented enum value. |

### **Template variables**

The following variables are used in the HTML templates and replaced when constructing the website. Variables are removed from the output pages in cases where they aren't needed (e.g. A page documenting a field won't contain a section for method parameters), or if no content is supplied.

| Variable                        | Description |
| ------------------------------- | ----------- |
| $rootpath                       | Path to the website's root. e.g. `/docs/api`. Used in the **page** template. |
| $navsection                     | Section on each page containing the site's navigation menu. Used in the **page** template. |
| $navnamespace                   | A namespace that appears in the navigation menu on each page. Used in the **page** template. |
| $navmembers                     | Used in the **navSection** template where members of a namespace should be inserted. |
| $navmembername                  | Used in the **navMember** template where the name of a member of a namespace should be inserted. |
| $navmemberurl                   | Used in the **navMember** template where the link to the page for a member of a namespace should be inserted. |
| $membername                     | Used in the **page** template where the name of the item being documented should be inserted. |
| $memberfullname                 | Used in the **page** template where the full name of the item (in the format "OwningType.ItemName") being documented should be inserted. |
| $memberqualifiedname            | Used in the **page** template where the qualified name of the (in the format "Namespace.OwningType.ItemName") item being documented should be inserted. |
| $membernametext                 | Used in the **page** template where the name of the item being documented should be inserted (in plain text). |
| $membertypetext                 | Used in the **page** template where the definition type (class, struct, method, property etc.) of the item being documented should be inserted (in lowercase). |
| $membertypetitletext            | Used in the **page** template where the definition type (class, struct, method, property etc.) of the item being documented should be inserted in Title Case. |
| $memberdeclaration              | Used in the **page** template where the documented item's declaration should be inserted. |
| $memberinherits                 | Used in the **page** template where a documented item's parent type should be inserted. |
| $memberimplements               | Used in the **page** template where interfaces a documented item implements should be inserted. |
| $membernamespace                | Used in the **page** template where a documented item's containing namespace should be inserted. |
| $memberassembly                 | Used in the **page** template where a documented item's containing assembly should be inserted. Limited as Doxygen doesn't export assembly data. The namespace is assumed as assembly. |
| $memberowner                    | Used in the **page** template where a documented item's owning type's name should be inserted. |
| $descriptionsection             | Used in the **page** template where a documented item's description should be inserted. |
| $typeparametersection           | Used in the **page** template where a documented item's type/template parameters should be inserted. |
| $typeparameters                 | Used in the **typeParameterSection** template where the individual type/template parameters should be inserted. |
| $typeparametername              | Used in the **typeParameter** template where the type/template parameter name/identifier should be inserted. |
| $typeparameterdescription       | Used in the **typeParameter** template where the type/template parameter description should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $accesstext                     | Used in member section templates (fieldSection, methodSection, etc.) where a member's access modifier should be inserted (in lowercase). |
| $accesstitletext                | Used in member section templates (fieldSection, methodSection, etc.) where a member's access modifier should be inserted in Title Case. |
| $fieldsection                   | Used in the **page** template where the section documenting an item's fields should be inserted. |
| $fields                         | Used in field section templates (fieldSection, instanceFieldSection, publicStaticFieldSection etc.) where the individual fields should be inserted. Fields are inserted as markup defined in the **field** template. |
| $fieldtype                      | Used in the **field** template where the field's type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $fieldname                      | Used in the **field** template where the field's name should be inserted. Names are inserted as links (`<a>` elements) to the field's documentation page. |
| $fielddescription               | Used in the **field** template where the field's description should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $propertysection                | Used in the **page** template where the section documenting an item's properties should be inserted. |
| $properties                     | Used in property section templates (propertySection, instancePropertySection, publicStaticPropertySection, etc.) where the individual properties should be inserted. Properties are inserted as markup defined in the **property** template. |
| $propertytype                   | Used in the **property** template where the property's type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $propertyname                   | Used in the **property** template where the property's name should be inserted. Names are inserted as links (`<a>` elements) to the property's documentation page. |
| $propertyaccessors              | Used in the **property** template where the property's accessors (get/set) should be inserted. Accessors are inserted as plain text. |
| $propertydescription            | Used in the **property** template where the property's description should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $methodsection                  | Used in the **page** template where the section documenting an item's methods should be inserted. |
| $methods                        | Used in method section templates (methodSection, instanceMethodSection, publicStaticMethodSection, etc.) where the individual methods should be inserted. Methods are inserted as markup defined in the **method** template. |
| $methodtype                     | Used in the **method** template where the method's return type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $methodname                     | Used in the **method** template where the method's name should be inserted. Names are inserted as links (`<a>` elements) to the method's documentation page. |
| $methodparameters               | Used in the **method** template where the method's parameters should be inserted. Parameters are inserted as markup containing links (`<a>` elements) to types documented in the project. |
| $methoddescription              | Used in the **method** template where the method's description should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $eventsection                   | Used in the **page** template where the section documenting an item's events should be inserted. |
| $events                         | Used in event section templates (eventSection, instanceEventSection, publicStaticEventSection etc.) where the individual events should be inserted. Events are inserted as markup defined in the **event** template. |
| $eventtype                      | Used in the **event** template where the event's type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $eventname                      | Used in the **event** template where the event's name should be inserted. Names are inserted as links (`<a>` elements) to the event's documentation page. |
| $eventdescription               | Used in the **event** template where the event's description should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $instancefieldsection           | Used in the **page** template where the section documenting an item's instance/non-static fields should be inserted. |
| $instancepropertysection        | Used in the **page** template where the section documenting an item's instance/non-static properties should be inserted. |
| $instancemethodsection          | Used in the **page** template where the section documenting an item's instance/non-static methods should be inserted. |
| $instanceeventsection           | Used in the **page** template where the section documenting an item's instance/non-static events should be inserted. |
| $publicfieldsection             | Used in the **page** template where the section documenting an item's public fields should be inserted. |
| $publicpropertysection          | Used in the **page** template where the section documenting an item's public properties should be inserted. |
| $publicmethodsection            | Used in the **page** template where the section documenting an item's public methods should be inserted. |
| $publiceventsection             | Used in the **page** template where the section documenting an item's public events should be inserted. |
| $protectedfieldsection          | Used in the **page** template where the section documenting an item's protected fields should be inserted. |
| $protectedpropertysection       | Used in the **page** template where the section documenting an item's protected properties should be inserted. |
| $protectedmethodsection         | Used in the **page** template where the section documenting an item's protected methods should be inserted. |
| $protectedeventsection          | Used in the **page** template where the section documenting an item's protected events should be inserted. |
| $staticfieldsection             | Used in the **page** template where the section documenting an item's static fields should be inserted. |
| $staticpropertysection          | Used in the **page** template where the section documenting an item's static properties should be inserted. |
| $staticmethodsection            | Used in the **page** template where the section documenting an item's static methods should be inserted. |
| $staticeventsection             | Used in the **page** template where the section documenting an item's static events should be inserted. |
| $publicstaticfieldsection       | Used in the **page** template where the section documenting an item's public static fields should be inserted. |
| $publicstaticpropertysection    | Used in the **page** template where the section documenting an item's public static properties should be inserted. |
| $publicstaticmethodsection      | Used in the **page** template where the section documenting an item's public static methods should be inserted. |
| $publicstaticeventsection       | Used in the **page** template where the section documenting an item's public static events should be inserted. |
| $protectedstaticfieldsection    | Used in the **page** template where the section documenting an item's protected static fields should be inserted. |
| $protectedstaticpropertysection | Used in the **page** template where the section documenting an item's protected static properties should be inserted. |
| $protectedstaticmethodsection   | Used in the **page** template where the section documenting an item's protected static methods should be inserted. |
| $protectedstaticeventsection    | Used in the **page** template where the section documenting an item's protected static events should be inserted. |
| $typesection                    | Used in the **page** template where the section documenting a field or property's type should be inserted. |
| $type                           | Used in the **typeSection** template where the field or property's type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $parametersection               | Used in the **page** template where the section documenting a method's parameters should be inserted. |
| $parameters                     | Used in the **parameterSection** template where the individual parameters should be inserted. Parameters are inserted as markup defined in the **parameter** template. |
| $parametertype                  | Used in the **parameter** template where the parameter's type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $parametername                  | Used in the **parameter** template where the parameter's name should be inserted. Parameter names are inserted as plain text. |
| $parameterdescription           | Used in the **parameter** template where the parameter's description should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $returnsection                  | Used in the **page** template where the section documenting a method's return value should be inserted. |
| $returntype                     | Used in the **returnSection** where the method's return type should be inserted. Types are inserted as links (`<a>` elements) where the type is documented in the project, otherwise it is plain text. |
| $returndescription              | Used in the **returnSection** where the description of the method's return value should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |
| $overloadsection                | Used in the **page** template where the section documenting a method's overloads should be inserted. |
| $valuesection                   | Used in the **page** template where the section documenting an enum's values should be inserted. |
| $values                         | Used in the **valueSection** template where the enum's individual values should be inserted. Enum values are inserted as markup defined in the **value** template. |
| $valuename                      | Used in the **value** template where the enum value's name should be inserted. Names are inserted as plain text. |
| $valuedescription               | Used in the **value** template where the description of the enum's value should be inserted. Descriptions are inserted as paragraphs (`<p>` elements). |


## **Manual**

### **CLI**

```
$ doxsite [options...]
```

| Option                          | Description |
| ------------------------------- | ----------- |
| -h,--help                       | Display manual/usage information. |
| -n,--new-project [&lt;path&gt;] | Create a new project at &lt;path&gt;. Creates a 'doxygen' folder containing a Doxyfile and XML folder for Doxygen output, and a 'develop' folder for the site with a default stylesheet. If &lt;path&gt; is omitted, project will be created in current working directory. |
| -d [&lt;doxyfile&gt;]           | Runs Doxygen before building documentation site. If &lt;doxyfile&gt; is omitted, Doxygen will attempt to run with a file named Doxyfile in the current working directory. |
| -x &lt;xmlpath&gt;              | Path to XML generated by Doxygen. Output location is defined by the `OUTPUT_DIRECTORY` and `XML` options in the Doxyfile. 'XML' used if option is omitted. |
| -i &lt;indexxml&gt;             | Filename for of the index xml file generated by Doxygen. Located in the `xmlpath` folder. 'index.xml' used if option is omitted. |
| -t &lt;templatesjson&gt;        | Templates used to generate documentation files. Path to a JSON file. Built-in templates used if omitted. |
| -o &lt;outputpath&gt;           | Path the documentation files are written to. If omitted, files will be created under a folder named 'API' in the current working directory. |
| -e &lt;outputfileextension&gt;  | File extension documentation pages use, typically html, but could also be php. 'html' used if option is omitted. |
| -r &lt;urlrootpath&gt;          | URL path to the documentation site root on the server/hosting environment. '/' used if option is omitted. |
| -a &lt;apisubpath&gt;           | Relative path from **urlrootpath** to the documentation files. 'API' used if option is omitted. |


### **JavaScript**

#### **Doxsite.createProject([projectPath])**

```js
import { Doxsite } from 'doxsite';

Doxsite.createProject('./Documentation');
```

Create a new project at a specified path. Creates a 'doxygen' folder containing a Doxyfile and XML folder for Doxygen output, a 'develop' folder for the site with a default stylesheet and JavaScript, as well as a 'templates' folder, containing default html templates for building a documentation site.

**Parameters**

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| projectPath | String | Path to create the project at. If no path is provided the project will be created in the current working directory. |


#### **Doxsite.buildDocs([config])**

```js
import { Doxsite } from 'doxsite';

Doxsite.buildDocs({
	xmlPath: 'doxygen/XML',
	templates: 'templates/templates.json',
	outputPath: 'develop',
	apiSubPath: 'API',
	searchdataSubPath: 'scripts'
});
```

Build documentation files using previously generated xml from Doxygen. This method can be re-run on its own after modifiying template files to reduce build time.

**Parameters**

| Name           | Type   | Description |
| -------------- | ------ | ----------- |
| config         | Object | A [BuildConfig object](#buildconfig-object) defining the options to use for generation of the site. If omitted, the defaults defined by BuildConfig will be used. |


#### **Doxsite.runDoxygen([doxyfile])**

```js
import { Doxsite } from 'doxsite';

Doxsite.runDoxygen('doxygen/Doxyfile');
```

Run Doxygen on the command line.

**Parameters**

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| doxyfile | String | Path to the Doxyfile. If no file is provided, Doxygen will attempt to run with a file named Doxyfile in the current working directory. |


#### **Doxsite.runBuild([doxyfile, buildConfig])**

```js
import { Doxsite } from 'doxsite';

Doxsite.runBuild('doxygen/Doxyfile', {
	xmlPath: 'doxygen/XML',
	templates: 'templates/templates.json',
	outputPath: 'develop',
	apiSubPath: 'API',
	searchdataSubPath: 'scripts'
});
```

Run Doxygen from the command line and build the documentation site. This method calls `Doxsite.runDoxygen` and `Doxsite.buildDocs` in order.

**Parameters**

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| doxyfile    | String | Path to the Doxyfile. If no file is provided, Doxygen will attempt to run with a file named Doxyfile in the current working directory. |
| buildConfig | Object | A [BuildConfig object](#buildconfig-object) defining the options to use for generation of the site. If omitted, the defaults defined by BuildConfig will be used. |


#### **BuildConfig object**

Defines options to use for Doxsite.buildDocs.

| Option              | Type           | Description |
| ------------------- | -------------- | ----------- |
| xmlPath             | String         | Path to XML generated by Doxygen. Output location is defined by the `OUTPUT_DIRECTORY` and `XML` options in the Doxyfile. 'XML' used if omitted. |
| xmlIndexFile        | String         | Filename for of the index xml file generated by Doxygen. Located in the **xmlPath** folder. 'index.xml' used if omitted. |
| templates           | String\|Object | Templates used to generate documentation files. Either a string path to a JSON file or JSON data containing `filePath` and `files` properties. Default templates used if omitted. See [Site customisation](#site-customisation) for more details. |
| outputPath          | String         | Path to the local root of the documentation site where pages will be created. |
| outputFileExtension | String         | File extension documentation files use, typically html, but could also be php. 'html' used if omitted. |
| urlRootPath         | String         | URL path to the documentation site root on the server/hosting environment. '/' used if omitted. |
| apiSubPath          | String         | Path relative from **outputPath**/**urlRootPath** where documentation pages will be created/located. |
| searchdataSubPath          | String         | Path relative from **outputPath**/**urlRootPath** where the search data file (searchdata.js) will be created/located. |

## **Support**

doxsite is an open-source project that only gets attention around paid work. If you like the tool, consider donating to my [PayPal](https://paypal.me/wondeluxe).
