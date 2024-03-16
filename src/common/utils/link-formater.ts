import { transliterate as tr } from 'transliteration';
import { removeInvalidCharacters } from './remove-invalid-characters';

export const linkFormater = (str: string) => {
  const updatedStr = removeInvalidCharacters(str).replace(/ /g, '-');
  return tr(updatedStr);
};
