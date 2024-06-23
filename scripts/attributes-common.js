/**
 * @param {Object} currentAttribute current Attribute Object if it's another collection or Value
 * @param {string} previousString current string to be used as a prefix for the attribute name
 * @param {number} currentDepth current depth of the recursion
 * @param {number} maxDepth maximum depth of the recursion
 * @returns Array of key value pairs of the attributes
 */
export function generateAttributes(currentAttribute, previousString, currentDepth, maxDepth) {
  if (currentDepth > maxDepth) {
    return [];
  }

  let attributes = [];
  const type = typeof currentAttribute;
  if (type === "object") {
    for (const key in currentAttribute) {
      let newString = "";
      if (previousString != "") {
        newString = previousString + ".";
      }
      newString += key;
      attributes = attributes.concat(
        generateAttributes(currentAttribute[key], newString, currentDepth + 1, maxDepth)
      );
    }
  } else if (type === "string") {
    attributes.push({
      attName: previousString,
      attValue:
        currentAttribute.length < 50 ? currentAttribute : currentAttribute.substring(0, 50) + "...",
    });
  } else if (type === "boolean" || type === "number" || type === "bigint") {
    attributes.push({
      attName: previousString,
      attValue: currentAttribute.toString(),
    });
  }
  return attributes;
}
