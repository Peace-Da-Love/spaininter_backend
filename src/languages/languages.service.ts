import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Language } from './languages.model';
import { InjectModel } from '@nestjs/sequelize';
import { AddLangDto } from './dto/add-lang.dto';

@Injectable()
export class LanguagesService {
  constructor(@InjectModel(Language) private languageModel: typeof Language) {}

  public async addLanguage(dto: AddLangDto) {
    const isExist = await this.languageModel.findOne({
      where: { language_code: dto.language_code.toLowerCase() },
    });

    if (isExist) {
      throw new HttpException(
        'Language already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.languageModel.create({
      language_code: dto.language_code.toLowerCase(),
      language_name: dto.language_name,
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Language has been added',
    };
  }

  public async getLanguages() {
    const languages = await this.languageModel.findAll({
      attributes: ['language_id', 'language_code'],
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Languages have been found',
      data: { languages },
    };
  }

  public async getAllLanguages() {
    return this.languageModel.findAll({
      attributes: ['language_id', 'language_code'],
    });
  }

  public async checkLanguageExists(languageIds: number[]): Promise<boolean> {
    const languages = await this.getAllLanguages();
    const languageIdsFromDb = languages.map((l) => l.language_id);

    if (languageIds.length !== languageIdsFromDb.length) return false;

    languageIds.sort();
    languageIdsFromDb.sort();

    for (let i = 0; i < languageIds.length; i++) {
      if (languageIds[i] !== languageIdsFromDb[i]) return false;
    }

    return true;
  }

  public async findLanguageByName(language_code: string): Promise<number> {
    const lang = await this.languageModel.findOne({
      where: { language_code },
      attributes: ['language_id'],
    });
    return lang.language_id;
  }
}
