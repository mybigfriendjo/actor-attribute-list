const MODULE_NAME = "5e-actor-attributes";

export class AttributeViewer extends Application {
  static characterName = "";

  constructor(actor) {
    super();
    this.actor = actor;
    this.characterName = actor.name;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "attribute-viewer",
      template: "modules/" + MODULE_NAME + "/templates/AttributeViewer.hbs",
      popOut: true,
      minimizable: true,
      resizable: true,
      editable: false,
      height: 600,
      title:
        game.i18n.localize("attributeViewer.appTitle") +
        " " +
        this.characterName,
    });
  }

  _buildAttributeStrings(currentAttribute, previousString) {
    let attributes = [];
    const type = typeof currentAttribute;
    if (type === "object") {
      for (const key in currentAttribute) {
        const str = previousString + "." + key;
        attributes = attributes.concat(
          this._buildAttributeStrings(currentAttribute[key], str)
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

  _getAttributeCategories(rollData) {
    const categories = [];
    for (const key in rollData) {
      categories.push({
        categoryName: key,
        attributes: this._buildAttributeStrings(rollData[key], key),
      });
    }
    return categories;
  }

  getData() {
    const data = {
      actorName: this.actor.name,
      categories: this._getAttributeCategories(this.actor.getRollData()),
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
