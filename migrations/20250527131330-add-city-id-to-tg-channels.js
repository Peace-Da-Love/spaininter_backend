'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tg_channels', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tg_channels', 'city_id');
  },
};