'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Base Deck',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        value: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        color: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Base Deck');
  }
};
