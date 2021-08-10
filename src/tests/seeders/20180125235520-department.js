'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

const departmentPerCompany = 5

module.exports = {
  up: function(queryInterface, Sequelize) {
    let departments = []
    for (let companyId = 0; companyId < 50; companyId++) {
      departments = [
        ...departments,
        ...[...Array(departmentPerCompany)].map((u, index) => ({
          id: companyId * departmentPerCompany + 1 + index,
          name: `Department ${companyId * departmentPerCompany +
            1 +
            index} c ${companyId + 1}`,
          companyId: companyId + 1
        }))
      ]
    }

    departments = departments.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('department', departments, {})
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('department', null, {})
  }
}
