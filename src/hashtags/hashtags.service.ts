import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Hashtag } from './hashtags.model';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { DeleteHashtagDto } from './dto/delete-hashtag.dto';
import { GetHashtagByIdDto } from './dto/get-hashtag-by-id.dto';
import { Sequelize } from 'sequelize-typescript';
import { literal, Op } from 'sequelize';
import { News } from '../news/news.model';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { NewsHashtag } from '../news/news-hashtag.model';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectModel(Hashtag) private hashtagModel: typeof Hashtag,
    private sequelize: Sequelize,
    @InjectModel(News) private newsModel: typeof News,
    @InjectModel(NewsHashtag) private newsHashtagModel: typeof NewsHashtag,
  ) {}

  public async createHashtag(dto: CreateHashtagDto) {
    const requestedName = dto.hashtag_name;

    if (!requestedName) {
      throw new HttpException(
        'hashtag_name is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const name = requestedName.toLowerCase().trim();

    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new HttpException(
        'Hashtag name must contain only lowercase letters, numbers, and underscores',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingHashtag = await this.hashtagModel.findOne({
      where: { hashtag_name: name },
    });

    if (existingHashtag) {
      throw new HttpException(
        'Hashtag with this name already exists',
        HttpStatus.CONFLICT,
      );
    }

    await this.hashtagModel.create({
      hashtag_name: name,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Hashtag created successfully',
    };
  }

  public async getHashtags() {
    const hashtags = await this.hashtagModel.findAll({
      attributes: [
        'hashtag_id',
        'hashtag_name',
        'createdAt',
        [
          literal(`(
            SELECT COUNT(DISTINCT nh.news_id)
            FROM news_hashtags AS nh
            INNER JOIN news AS n ON n.news_id = nh.news_id
            WHERE nh.hashtag_id = "Hashtag"."hashtag_id"
              AND n.status = 'approved'
          )`),
          'news_count',
        ],
      ],
      where: {
        hashtag_name: { [Op.ne]: null },
      },
      order: [
        [literal('"news_count"'), 'DESC'],
        ['hashtag_name', 'ASC'],
      ],
      raw: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Hashtags have been found',
      data: { hashtags },
    };
  }

  public async deleteHashtag(dto: DeleteHashtagDto) {
    const id = Number(dto.id);
    const isHashtagExists = await this.checkHashtagIdExists(id);

    if (!isHashtagExists)
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);

    const t = await this.sequelize.transaction();

    try {
      const newsWithDeletedPrimaryHashtag = await this.newsModel.findAll({
        attributes: ['news_id'],
        where: { hashtag_id: id },
        transaction: t,
      });

      for (const news of newsWithDeletedPrimaryHashtag) {
        const replacement = await this.newsHashtagModel.findOne({
          where: {
            news_id: news.news_id,
            hashtag_id: { [Op.ne]: id },
          },
          transaction: t,
        });

        if (!replacement) {
          throw new HttpException(
            'Cannot delete hashtag because it is the only hashtag for one or more news',
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.newsModel.update(
          { hashtag_id: replacement.hashtag_id },
          { where: { news_id: news.news_id }, transaction: t },
        );
      }

      await this.newsHashtagModel.destroy({
        where: { hashtag_id: id },
        transaction: t,
      });

      await this.hashtagModel.destroy({
        where: { hashtag_id: id },
        transaction: t,
      });

      await t.commit();
    } catch (err) {
      await t.rollback();
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Hashtag has been deleted',
    };
  }

  public async getHashtagById(dto: GetHashtagByIdDto) {
    const id = Number(dto.id);

    const isHashtagExists = await this.checkHashtagIdExists(id);

    if (!isHashtagExists)
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);

    const hashtag = await this.hashtagModel.findOne({
      attributes: ['hashtag_id', 'hashtag_name', 'createdAt'],
      where: { hashtag_id: id },
      raw: true,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Hashtag has been found',
      data: {
        hashtag,
      },
    };
  }

  public async updateHashtag(dto: UpdateHashtagDto) {
    const hashtagId = dto.hashtagId;
    const hashtagName = dto.hashtagName;

    if (!hashtagId || !hashtagName) {
      throw new HttpException(
        'Hashtag id and name are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isHashtagExists = await this.checkHashtagIdExists(hashtagId);

    if (!isHashtagExists)
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);

    const normalizedName = hashtagName.trim();

    if (normalizedName.length < 2)
      throw new HttpException(
        'Hashtag name must be a string with at least 2 characters',
        HttpStatus.BAD_REQUEST,
      );

    await this.hashtagModel.update(
      { hashtag_name: normalizedName.toLowerCase() },
      { where: { hashtag_id: hashtagId } },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Hashtag has been updated',
    };
  }

  public async findHashtagByName(hashtagName: string): Promise<number> {
    const normalizedName = hashtagName.toLowerCase();

    const hashtag = await this.hashtagModel.findOne({
      where: { hashtag_name: normalizedName },
    });

    if (!hashtag)
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);

    return hashtag.hashtag_id;
  }

  public async findHashtagById(hashtagId: number): Promise<string> {
    const hashtag = await this.hashtagModel.findByPk(hashtagId);

    if (!hashtag || !hashtag.hashtag_name)
      throw new HttpException('Hashtag not found', HttpStatus.NOT_FOUND);

    return hashtag.hashtag_name;
  }

  public async checkHashtagIdExists(hashtagId: number): Promise<boolean> {
    const hashtag = await this.hashtagModel.findByPk(hashtagId);
    return !!hashtag;
  }

  public async findOrCreateHashtag(hashtagName: string): Promise<number> {
    const normalizedName = hashtagName.toLowerCase().trim();

    if (!/^[a-z0-9_]+$/.test(normalizedName)) {
      throw new HttpException(
        'Hashtag name must contain only lowercase letters, numbers, and underscores',
        HttpStatus.BAD_REQUEST,
      );
    }

    let hashtag = await this.hashtagModel.findOne({
      where: { hashtag_name: normalizedName },
    });

    if (hashtag) {
      return hashtag.hashtag_id;
    }

    hashtag = await this.hashtagModel.create({
      hashtag_name: normalizedName,
    });

    return hashtag.hashtag_id;
  }
}
