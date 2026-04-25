module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('news', 'status', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('news', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.sequelize.query(
      "UPDATE news SET status = 'approved' WHERE status = 'pending' OR status IS NULL",
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('news', 'user_id');
    await queryInterface.removeColumn('news', 'status');
  },
};
