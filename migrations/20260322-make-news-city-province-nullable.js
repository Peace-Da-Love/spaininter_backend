module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('news', 'province', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.changeColumn('news', 'city', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('news', 'province', {
      type: Sequelize.STRING(50),
      allowNull: false,
    });

    await queryInterface.changeColumn('news', 'city', {
      type: Sequelize.STRING(50),
      allowNull: false,
    });
  },
};
