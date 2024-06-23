import { generateAttributes } from "./attributes-common.js";

/**
 * @param {Actor} actor takes an actor object that will be used to generate the attributes
 * @returns Array of categories with their attributes
 */
export function getSWADEData(actor, maxDepth) {
  const rollData = actor.getRollData();
  const categories = [];
  categories.push({
    categoryName: "Inline Rolls",
    attributes: generateAttributes(rollData, "", 0, maxDepth),
  });
  return categories;
}
