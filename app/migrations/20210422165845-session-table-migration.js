'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'session',
      {
        sid: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false
        },
        sess: {
          type: Sequelize.JSON,
          allowNull: false
        },
        expire: {
          type: 'TIMESTAMP',
          allowNull: false
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('session');
  }
};
