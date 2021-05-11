'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    .then(() => {
      return queryInterface.createTable(
        'Game',
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('uuid_generate_v4()'),
            primaryKey: true,
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Game');
  }
};
