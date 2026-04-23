module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('news', ['hashtag_id'], {
      name: 'news_hashtag_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('news', 'news_hashtag_id_idx');
  },
};
