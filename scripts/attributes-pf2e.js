import { generateAttributes } from "./attributes-common.js";

export function getPf2eData(actor, maxDepth) {
  const rollData = actor.system;
  const categories = [];
  for (const key in rollData) {
    if (key == "_migration") continue;
    const atts = generateAttributes(rollData[key], key, 0, maxDepth);
    const modifiedAtts = atts.map((att) => ({
      ...att,
      attName: `actor.${att.attName}`,
    }));

    categories.push({
      categoryName: key,
      attributes: modifiedAtts,
    });
  }
  return categories;
}
