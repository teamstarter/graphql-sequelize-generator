'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

module.exports = {
  up: function (queryInterface, Sequelize) {
    let companies = [...Array(50)].map((u, index) => ({
      id: index + 1,
      name: `Company ${index + 1}`,
      companyTypeId: index % 4
    }))

    companies = companies.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('company', companies, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('company', null, {})
  }
}
