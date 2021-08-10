'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

const departmentPerCompany = 3

module.exports = {
  up: function(queryInterface, Sequelize) {
    let locations = []
    for (let companyId = 0; companyId < 50; companyId++) {
      locations = [
        ...locations,
        ...[...Array(departmentPerCompany)].map((u, index) => ({
          id: companyId * departmentPerCompany + 1 + index,
          name: `Location ${companyId * departmentPerCompany +
            1 +
            index} c ${companyId + 1}`,
          companyId: companyId + 1
        }))
      ]
    }

    locations = locations.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('location', locations, {})
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('location', null, {})
  }
}
