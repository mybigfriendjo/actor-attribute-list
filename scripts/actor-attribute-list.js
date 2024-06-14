import { getDnd5eData } from "./attributes-dnd5e.js";
import { getPf2eData } from "./attributes-pf2e.js";

const AAL = {
  NAME: "actor-attribute-list",
  TEMPLATE_PATH: "modules/actor-attribute-list/templates/",
  SETTINGS: {
    SHOW_FOR_DM_ONLY: "showForDMOnly",
    DEFAULT_SHOW_FOR_DM_ONLY: true,
    MAX_DEPTH: "maxDepth",
    DEFAULT_MAX_DEPTH: 10,
  },
  VALID_SYSTEMS: ["dnd5e", "pf2e"],
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
      template: AAL.TEMPLATE_PATH + "AttributeViewer.hbs",
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
    return game.i18n.localize(AAL.NAME + ".attributeViewer.appTitle") + " " + this.actor.name;
  }

  /**
   * @override
   */
  getData() {
    if (!this.actor) {
      return {};
    }

    if (!AAL.VALID_SYSTEMS.includes(game.system.id)) {
      return {};
    }

    let categories = [];
    const maxDepth = game.settings.get(AAL.NAME, AAL.SETTINGS.MAX_DEPTH);

    switch (game.system.id) {
      case "dnd5e":
        categories = getDnd5eData(this.actor, maxDepth);
        break;
      case "pf2e":
        categories = getPf2eData(this.actor, maxDepth);
        break;
    }

    const data = {
      appID: AAL.NAME,
      actorName: this.actor.name,
      categories: categories,
    };
    return data;
  }

  /**
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    $(html)
      .find("#attributeListFilter")
      .on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".attribute-viewer-category table tr").each(function () {
          var found = false;
          $(this)
            .find("td")
            .each(function () {
              var text = $(this).text().toLowerCase();
              if (text.includes(value)) {
                found = true;
                return false; // exit the loop
              }
            });
          if (!found) {
            $(this)
              .find("td input")
              .each(function () {
                var text = $(this).val().toLowerCase();
                if (text.includes(value)) {
                  found = true;
                  return false; // exit the loop
                }
              });
          }
          if (!found) {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      });

    $(html)
      .find(".attribute-viewer-key-field")
      .on("click", function () {
        $(this).select();
      });
  }
}

Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  if (!AAL.VALID_SYSTEMS.includes(game.system.id)) {
    return;
  }

  if (game.settings.get(AAL.NAME, AAL.SETTINGS.SHOW_FOR_DM_ONLY) && !game.user.isGM) {
    return;
  }

  buttons.unshift({
    class: "showAttributes",
    icon: "fas fa-dice",
    label: game.i18n.localize(AAL.NAME + ".actorSheet.headerButtonLabel"),
    onclick: async () => {
      let actor = app.actor;
      new AttributeViewer(actor).render(true);
    },
  });
});

Hooks.on("init", () => {
  game.settings.register(AAL.NAME, AAL.SETTINGS.SHOW_FOR_DM_ONLY, {
    name: game.i18n.localize(AAL.NAME + ".settings.showForDMOnly.name"),
    hint: game.i18n.localize(AAL.NAME + ".settings.showForDMOnly.hint"),
    scope: "world",
    config: true,
    default: AAL.SETTINGS.DEFAULT_SHOW_FOR_DM_ONLY,
    type: Boolean,
  });
  game.settings.register(AAL.NAME, AAL.SETTINGS.MAX_DEPTH, {
    name: game.i18n.localize(AAL.NAME + ".settings.maxDepth.name"),
    hint: game.i18n.localize(AAL.NAME + ".settings.maxDepth.hint"),
    scope: "world",
    config: true,
    default: AAL.SETTINGS.DEFAULT_MAX_DEPTH,
    type: Number,
  });
});
