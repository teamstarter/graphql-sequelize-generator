'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

module.exports = {
  up: function (queryInterface, Sequelize) {
    let companyTypes = [
      {
        id: 1,
        name: 'Corporation'
      },
      {
        id: 2,
        name: 'Nonprofit Corporation'
      },
      {
        id: 3,
        name: 'Trust'
      },
      {
        id: 4,
        name: 'Association'
      }
    ]

    companyTypes = companyTypes.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('companyType', companyTypes, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('companyType', null, {})
  }
}
