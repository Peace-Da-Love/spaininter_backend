export function removeInvalidCharacters(str: string) {
  const trimmedStr = str.replace(/\s+/g, ' ').trim();
  // Remove all characters that are not letters in any language
  const regExp = /[^\p{L}\p{M}\s]/gu;
  return trimmedStr.toLowerCase().replace(regExp, '');
}
