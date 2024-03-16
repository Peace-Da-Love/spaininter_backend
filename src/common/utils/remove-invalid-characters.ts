export const removeInvalidCharacters = (url: string) => {
  const invalidCharacters = /[^\-._~:/?#[\]@!$&'()*+,;=%?]/g;
  const cleanedUrl = url.replace(invalidCharacters, '');
  return cleanedUrl.toLowerCase();
};
