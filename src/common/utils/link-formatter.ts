import { transliterate as tr } from 'transliteration';
import { removeInvalidCharacters } from './remove-invalid-characters';

export const linkFormatter = (str: string, id: number) => {
  const updatedStr = removeInvalidCharacters(str).replace(/ /g, '-');
  return `${id}-${tr(updatedStr)}`;
};
