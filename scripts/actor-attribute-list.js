import { getDCCData } from "./attributes-dcc.js";
import { getDnd5eData } from "./attributes-dnd5e.js";
import { getOSEData } from "./attributes-ose.js";
import { getPf2eData } from "./attributes-pf2e.js";
import { getSWADEData } from "./attributes-swade.js";
import { getWWNData } from "./attributes-wwn.js";

const SYSTEM_DCC = "dcc";
const SYSTEM_DND5E = "dnd5e";
const SYSTEM_OSE = "ose";
const SYSTEM_PF2E = "pf2e";
const SYSTEM_SWADE = "swade";
const SYSTEM_WWN = "wwn";

const AAL = {
  NAME: "actor-attribute-list",
  TEMPLATE_PATH: "modules/actor-attribute-list/templates/",
  SETTINGS: {
    SHOW_FOR_DM_ONLY: "showForDMOnly",
    DEFAULT_SHOW_FOR_DM_ONLY: true,
    MAX_DEPTH: "maxDepth",
    DEFAULT_MAX_DEPTH: 10,
    SHOW_SYSTEM_WARNING: "systemWarning",
    DEFAULT_SHOW_SYSTEM_WARNING: true,
  },
  VALID_SYSTEMS: [SYSTEM_DCC, SYSTEM_DND5E, SYSTEM_OSE, SYSTEM_PF2E, SYSTEM_SWADE, SYSTEM_WWN],
  NON_ENRICHED_SYSTEMS: [SYSTEM_OSE, SYSTEM_WWN],
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
      case SYSTEM_DCC:
        categories = getDCCData(this.actor, maxDepth);
        break;
      case SYSTEM_DND5E:
        categories = getDnd5eData(this.actor, maxDepth);
        break;
      case SYSTEM_OSE:
        categories = getOSEData(this.actor, maxDepth);
        break;
      case SYSTEM_PF2E:
        categories = getPf2eData(this.actor, maxDepth);
        break;
      case SYSTEM_SWADE:
        categories = getSWADEData(this.actor, maxDepth);
        break;
      case SYSTEM_WWN:
        categories = getWWNData(this.actor, maxDepth);
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
                return false;
              }
            });
          if (!found) {
            $(this)
              .find("td input")
              .each(function () {
                var text = $(this).val().toLowerCase();
                if (text.includes(value)) {
                  found = true;
                  return false;
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

  if (AAL.NON_ENRICHED_SYSTEMS.includes(game.system.id)) {
    game.settings.register(AAL.NAME, AAL.SETTINGS.SHOW_SYSTEM_WARNING, {
      name: game.i18n.localize(AAL.NAME + ".settings.systemWarning.name"),
      hint: game.i18n.localize(AAL.NAME + ".settings.systemWarning.hint"),
      scope: "world",
      config: true,
      default: AAL.SETTINGS.DEFAULT_SHOW_SYSTEM_WARNING,
      type: Boolean,
    });
  }
});

Hooks.on("ready", () => {
  if (AAL.NON_ENRICHED_SYSTEMS.includes(game.system.id)) {
    if (game.settings.get(AAL.NAME, AAL.SETTINGS.SHOW_SYSTEM_WARNING) && game.user.isGM) {
      ChatMessage.create({
        content: `<div>
                        <p>Message from Module "Actor Attribute List"</p>
                        <p>While the Module is available and will show Attributes for an Actor Sheet, to my current knowledge the System does not enrich Descriptions.
                        This means you likely won't get automatic Inline Rolls and similar things.</p>
                        <p>This is up to the System to implement. I hope the Attributes will still help as informational Values.</p>
                    </div>`,
        user: game.userId,
        type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
        whisper: [game.userId],
      });
      game.settings.set(AAL.NAME, AAL.SETTINGS.SHOW_SYSTEM_WARNING, false);
    }
  }
});
