const MODULE_CONSTANTS = {
  MODULE_NAME: "actor-attribute-list",
  MODULE_TEMPLATE_PATH: "modules/actor-attribute-list/templates/",
  MODULE_SETTINGS: {
    SHOW_FOR_DM_ONLY: "showForDMOnly",
    DEFAULT_SHOW_FOR_DM_ONLY: true,
    MAX_DEPTH: "maxDepth",
    DEFAULT_MAX_DEPTH: 10,
  },
};

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
      template: MODULE_CONSTANTS.MODULE_TEMPLATE_PATH + "AttributeViewer.hbs",
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
      game.i18n.localize(
        MODULE_CONSTANTS.MODULE_NAME + ".attributeViewer.appTitle"
      ) +
      " " +
      this.actor.name
    );
  }

  /**
   * @param {Object} currentAttribute current Attribute Object if it's another collection or Value
   * @param {string} previousString current string to be used as a prefix for the attribute name
   * @param {int} currentDepth current depth of the recursion
   * @returns Array of key value pairs of the attributes
   */

  _generateAttributes(currentAttribute, previousString, currentDepth) {
    if (
      currentDepth >
      game.settings.get(
        MODULE_CONSTANTS.MODULE_NAME,
        MODULE_CONSTANTS.MODULE_SETTINGS.MAX_DEPTH
      )
    ) {
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
      appID: MODULE_CONSTANTS.MODULE_NAME,
      actorName: this.actor.name,
      categories: this._generateCategories(this.actor.getRollData()),
    };
    return data;
  }
}

Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  if (
    game.settings.get(
      MODULE_CONSTANTS.MODULE_NAME,
      MODULE_CONSTANTS.MODULE_SETTINGS.SHOW_FOR_DM_ONLY
    ) &&
    !game.user.isGM
  ) {
    return;
  }
  buttons.unshift({
    class: "showAttributes",
    icon: "fas fa-dice",
    label: game.i18n.localize(
      MODULE_CONSTANTS.MODULE_NAME + ".actorSheet.headerButtonLabel"
    ),
    onclick: async () => {
      let actor = app.actor;
      new AttributeViewer(actor).render(true);
    },
  });
});

Hooks.once("init", () => {
  game.settings.register(
    MODULE_CONSTANTS.MODULE_NAME,
    MODULE_CONSTANTS.MODULE_SETTINGS.SHOW_FOR_DM_ONLY,
    {
      name: game.i18n.localize(
        MODULE_CONSTANTS.MODULE_NAME + ".settings.showForDMOnly.name"
      ),
      hint: game.i18n.localize(
        MODULE_CONSTANTS.MODULE_NAME + ".settings.showForDMOnly.hint"
      ),
      scope: "world",
      config: true,
      default: MODULE_CONSTANTS.MODULE_SETTINGS.DEFAULT_SHOW_FOR_DM_ONLY,
      type: Boolean,
    }
  );
  game.settings.register(
    MODULE_CONSTANTS.MODULE_NAME,
    MODULE_CONSTANTS.MODULE_SETTINGS.MAX_DEPTH,
    {
      name: game.i18n.localize(
        MODULE_CONSTANTS.MODULE_NAME + ".settings.maxDepth.name"
      ),
      hint: game.i18n.localize(
        MODULE_CONSTANTS.MODULE_NAME + ".settings.maxDepth.hint"
      ),
      scope: "world",
      config: true,
      default: MODULE_CONSTANTS.MODULE_SETTINGS.DEFAULT_MAX_DEPTH,
      type: Number,
    }
  );
});
