const MODULE_NAME = "5e-actor-attributes";

export class AttributeViewer extends Application {
  /**
   * @param {Actor} actor takes an actor object that will be used to generate the attributes
   */
  constructor(actor) {
    super();
    this.actor = actor;
  }

  /**
   * @override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "attribute-viewer",
      template: "modules/" + MODULE_NAME + "/templates/AttributeViewer.hbs",
      popOut: true,
      minimizable: true,
      resizable: true,
      editable: false,
      height: 600,
    });
  }

  /**
   * @override
   */
  get title() {
    return (
      game.i18n.localize("attributeViewer.appTitle") + " " + this.actor.name
    );
  }

  maxDepth = 10;

  /**
   * @param {Object} currentAttribute current Attribute Object if it's another collection or Value
   * @param {string} previousString current string to be used as a prefix for the attribute name
   * @param {int} currentDepth current depth of the recursion
   * @returns Array of key value pairs of the attributes
   */

  _generateAttributes(currentAttribute, previousString, currentDepth) {
    if (currentDepth > this.maxDepth) {
      return [];
    }
    let attributes = [];
    const type = typeof currentAttribute;
    if (type === "object") {
      for (const key in currentAttribute) {
        const str = previousString + "." + key;
        attributes = attributes.concat(
          this._generateAttributes(currentAttribute[key], str, currentDepth + 1)
        );
      }
    } else if (type === "string") {
      attributes.push({
        attName: previousString,
        attValue:
          currentAttribute.length < 50
            ? currentAttribute
            : currentAttribute.substring(0, 50) + "...",
      });
    } else if (type === "boolean" || type === "number" || type === "bigint") {
      attributes.push({
        attName: previousString,
        attValue: currentAttribute.toString(),
      });
    }
    return attributes;
  }

  /**
   * @param {Object} rollData roll data from the actor
   * @returns Object with name of character and Array of categories with their attributes
   */
  _generateCategories(rollData) {
    const categories = [];
    for (const key in rollData) {
      categories.push({
        categoryName: key,
        attributes: this._generateAttributes(rollData[key], key, 0),
      });
    }
    return categories;
  }

  /**
   * @override
   */
  getData() {
    const data = {
      actorName: this.actor.name,
      categories: this._generateCategories(this.actor.getRollData()),
    };
    return data;
  }
}

Hooks.on("getActorSheet5eCharacterHeaderButtons", (app, buttons) => {
  if (!game.user.isGM) {
    return;
  }
  buttons.unshift({
    class: "showAttributes",
    icon: "fas fa-dice",
    label: game.i18n.localize("actorSheet.headerButtonLabel"),
    onclick: async () => {
      let actor = app.actor;
      new AttributeViewer(actor).render(true);
    },
  });
});
