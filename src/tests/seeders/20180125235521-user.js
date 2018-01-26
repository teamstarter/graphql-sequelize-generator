'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

module.exports = {
  up: function (queryInterface, Sequelize) {
    let users = [
      {
        id: 1,
        name: 'User 1',
        companyId: 1
      },
      {
        id: 2,
        name: 'User 2',
        companyId: 2
      }
    ]

    users = users.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('user', users, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user', null, {})
  }
}
