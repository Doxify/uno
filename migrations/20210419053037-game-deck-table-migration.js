'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Game Deck',
      {
        game: {
          type: Sequelize.UUID,
          primaryKey: true,
          references: {model: 'Game', key: 'id'}
        },
        user: {
          type: Sequelize.UUID,
          references: {model: 'User', key: 'id'}
        },
        card: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {model: 'Base Deck', key: 'id'}
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Game Deck');
  }
};
