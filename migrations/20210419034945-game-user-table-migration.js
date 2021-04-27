'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'GameUsers',
      {
        user_id: {
          type: Sequelize.INTEGER,
          primaryKey:true,
          references: {model: 'User', key: 'id'}
        },
        game_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
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
