'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Game User',
      {
        user: {
          type: Sequelize.UUID,
          primaryKey:true,
          references: {model: 'User', key: 'id'}
        },
        game: {
          type: Sequelize.UUID,
          primaryKey:true,
          references: {model: 'Game', key: 'id'}
        },
        player_num: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        current_player: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        winner: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Game User');
  }
};
