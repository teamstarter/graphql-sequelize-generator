'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

module.exports = {
  up: function (queryInterface, Sequelize) {
    let companies = [
      {
        id: 1,
        name: 'Company 1'
      },
      {
        id: 2,
        name: 'Company 2'
      }
    ]

    companies = companies.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('company', companies, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('company', null, {})
  }
}
