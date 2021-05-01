'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Game',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        direction_clockwise: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Game');
  }
};
