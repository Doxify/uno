'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Game Deck',
      {
        game_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          references: {model: 'Game', key: 'id'}
        },
        user_id: {
          type: Sequelize.INTEGER,
          references: {model: 'User', key: 'id'}
        },
        card_id: {
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
