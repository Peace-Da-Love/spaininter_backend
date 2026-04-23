import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Hashtag } from './hashtags.model';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { DeleteHashtagDto } from './dto/delete-hashtag.dto';
import { GetHashtagByIdDto } from './dto/get-hashtag-by-id.dto';
import { Sequelize } from 'sequelize-typescript';
import { col, fn, literal, Op } from 'sequelize';
import { News } from '../news/news.model';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectModel(Hashtag) private hashtagModel: typeof Hashtag,
    private sequelize: Sequelize,
    @InjectModel(News) private newsModel: typeof News,
  ) {}

  public async createHashtag(dto: CreateHashtagDto) {
    const requestedName = dto.hashtag_name;

    if (!requestedName) {
      throw new HttpException('hashtag_name is required', HttpStatus.BAD_REQUEST);
    }

    const name = requestedName.toLowerCase().trim();

    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new HttpException(
        'Hashtag name must contain only lowercase letters, numbers, and underscores',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.findOrCreateHashtag(name);

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
        [fn('COUNT', col('blogs.news_id')), 'news_count'],
      ],
      where: {
        hashtag_name: { [Op.ne]: null },
      },
      include: [
        {
          model: News,
          as: 'blogs',
          attributes: [],
          where: {
            status: 'approved',
          },
          required: false,
        },
      ],
      group: ['Hashtag.hashtag_id', 'Hashtag.hashtag_name', 'Hashtag.createdAt'],
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
      await this.hashtagModel.destroy({
        where: { hashtag_id: id },
        transaction: t,
      });

      await this.newsModel.destroy({
        where: { hashtag_id: id },
        transaction: t,
      });

      await t.commit();
    } catch (err) {
      await t.rollback();
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
