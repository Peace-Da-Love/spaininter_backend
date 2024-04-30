export function removeInvalidCharacters(str: string) {
  // Remove all characters that are not letters in any language
  const regExp = /[^\p{L}\p{N}\p{M}\s]/gu;
  return str
    .toLowerCase()
    .replace(regExp, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
