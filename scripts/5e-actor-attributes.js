const MODULE_NAME = "5e-actor-attributes";

export class AttributeViewer extends Application {
  constructor(actor) {
    super();
    this.actor = actor;
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
    });
  }

  get title() {
    return (
      game.i18n.localize("attributeViewer.appTitle") + " " + this.actor.name
    );
  }

  _generateAttributes(currentAttribute, previousString) {
    let attributes = [];
    const type = typeof currentAttribute;
    if (type === "object") {
      for (const key in currentAttribute) {
        const str = previousString + "." + key;
        attributes = attributes.concat(
          this._generateAttributes(currentAttribute[key], str)
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

  _generateCategories(rollData) {
    const categories = [];
    for (const key in rollData) {
      categories.push({
        categoryName: key,
        attributes: this._generateAttributes(rollData[key], key),
      });
    }
    return categories;
  }

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
