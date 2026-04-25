module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      tg_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      username: Sequelize.STRING,
      first_name: Sequelize.STRING,
      last_name: Sequelize.STRING,
      photo_url: Sequelize.STRING,

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // Gift snapshot
      gift_background: Sequelize.STRING,
      gift_pattern: Sequelize.STRING,
      gift_model: Sequelize.STRING,
      gift_rarity: Sequelize.STRING,
      gift_updated_at: Sequelize.DATE,

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
