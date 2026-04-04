module.exports = {
  async up(queryInterface) {
    await queryInterface.renameTable('categories', 'hashtags');
    await queryInterface.renameColumn('hashtags', 'category_id', 'hashtag_id');
    await queryInterface.renameColumn('hashtags', 'category_name', 'hashtag_name');
    await queryInterface.renameColumn('news', 'category_id', 'hashtag_id');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('news', 'hashtag_id', 'category_id');
    await queryInterface.renameColumn('hashtags', 'hashtag_name', 'category_name');
    await queryInterface.renameColumn('hashtags', 'hashtag_id', 'category_id');
    await queryInterface.renameTable('hashtags', 'categories');
  },
};
