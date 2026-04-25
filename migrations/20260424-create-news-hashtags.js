module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('news_hashtags', {
      news_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'news',
          key: 'news_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      hashtag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'hashtags',
          key: 'hashtag_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
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

    await queryInterface.addIndex('news_hashtags', ['hashtag_id'], {
      name: 'news_hashtags_hashtag_id_idx',
    });

    await queryInterface.sequelize.query(`
      INSERT INTO news_hashtags ("news_id", "hashtag_id", "createdAt", "updatedAt")
      SELECT "news_id", "hashtag_id", NOW(), NOW()
      FROM news
      WHERE "hashtag_id" IS NOT NULL
      ON CONFLICT ("news_id", "hashtag_id") DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('news_hashtags');
  },
};
