module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('category_translations');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('category_translations', {
      translation_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'languages',
          key: 'language_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
};
