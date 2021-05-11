'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      .then(() => {
        queryInterface.createTable(
          'User',
          {
            id: {
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal('uuid_generate_v4()'),
              primaryKey: true,
            },
            username: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            email: {
              unique: true,
              type: Sequelize.STRING,
              allowNull: false,
            },
            password: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            createdAt: {
              type: Sequelize.DATE,
              defaultValue: Sequelize.literal('NOW()'),
              allowNull: false,
            }
          })
      });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('User');
  }
};
