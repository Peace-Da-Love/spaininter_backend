import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { City } from './cities.entity';
// import { TgChannel } from '../telegram-newsletter/telegram-newsletter.model';
import { Op, WhereOptions } from 'sequelize';
import { AddCityLinkDto } from './dto/add-city-link.dto';
import { DeleteCityLinkDto } from './dto/delete-city-link.dto';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class CitiesService {
  constructor(@InjectModel(City) private cityModel: typeof City) {}

  async findOne(id: number) {
    return await this.cityModel.findByPk(id, {
      // include: [{ model: TgChannel, as: 'channels' }],
      attributes: [
        'id',
        'name',
        'photo_url',
        'links',
        'created_at',
        'updated_at',
      ],
    });
  }

  async create(cityData: { name: string; photo_url?: string }) {
    return this.cityModel.create(cityData);
  }

  async findAll({
    page,
    limit,
    hasPhoto,
    search,
  }: {
    page: number;
    limit: number;
    hasPhoto?: boolean;
    search?: string;
  }) {
    const where: WhereOptions<City> = hasPhoto
      ? { photo_url: { [Op.ne]: null } }
      : {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const offset = (page - 1) * limit;
    const cities = await this.cityModel.findAndCountAll({
      where,
      // include: [{ model: TgChannel, as: 'channels' }],
      limit,
      offset,
      attributes: [
        'id',
        'name',
        'photo_url',
        'links',
        'created_at',
        'updated_at',
      ],
    });
    return { data: { rows: cities.rows, count: cities.count } };
  }

  async removePhoto(id: number) {
    const city = await this.findOne(id);
    if (!city) {
      throw new HttpException('City not found', HttpStatus.NOT_FOUND);
    }

    if (city.photo_url) {
      const photoPath = join(process.cwd(), city.photo_url);
      try {
        await unlink(photoPath);
      } catch (error) {
        console.error(`Ошибка при удалении файла: ${photoPath}`, error);
      }
    }

    await city.update({ photo_url: null, links: [] });

    return {
      statusCode: HttpStatus.OK,
      message: 'Photo and links removed successfully',
      data: await this.findOne(id),
    };
  }

  async update(id: number, cityData: { photo_url?: string }) {
    const city = await this.findOne(id);
    if (!city) {
      throw new HttpException('City not found', HttpStatus.NOT_FOUND);
    }

    if (
      cityData.photo_url &&
      city.photo_url &&
      city.photo_url !== cityData.photo_url
    ) {
      const oldPhotoPath = join(process.cwd(), city.photo_url);

      if (oldPhotoPath.startsWith(join(process.cwd(), 'uploads', 'cities'))) {
        try {
          await unlink(oldPhotoPath);
        } catch (error) {
          console.warn('Не удалось удалить старое фото:', error.message);
        }
      }
    }

    return city.update(cityData);
  }

  async addLink(dto: AddCityLinkDto) {
    const city = await this.cityModel.findByPk(dto.cityId);
    if (!city) {
      throw new HttpException('City not found', HttpStatus.NOT_FOUND);
    }
    const links = Array.isArray(city.links) ? [...city.links] : [];
    links.push({ id: uuidv4(), name: dto.name, url: dto.url });
    await city.update({ links }, { returning: true });
    return {
      statusCode: HttpStatus.OK,
      message: 'Link added successfully',
      data: await this.cityModel.findByPk(dto.cityId, {
        attributes: [
          'id',
          'name',
          'photo_url',
          'links',
          'created_at',
          'updated_at',
        ],
      }),
    };
  }

  async deleteLink(dto: DeleteCityLinkDto) {
    const city = await this.cityModel.findByPk(dto.cityId);
    if (!city) {
      throw new HttpException('City not found', HttpStatus.NOT_FOUND);
    }
    const links = Array.isArray(city.links) ? [...city.links] : [];
    const updatedLinks = links.filter((link) => link.id !== dto.linkId);
    if (links.length === updatedLinks.length) {
      throw new HttpException('Link not found', HttpStatus.NOT_FOUND);
    }
    await city.update({ links: updatedLinks }, { returning: true });
    return {
      statusCode: HttpStatus.OK,
      message: 'Link deleted successfully',
      data: await this.cityModel.findByPk(dto.cityId, {
        attributes: [
          'id',
          'name',
          'photo_url',
          'links',
          'created_at',
          'updated_at',
        ],
      }),
    };
  }
}
