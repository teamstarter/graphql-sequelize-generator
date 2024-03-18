'use strict'
const timestamp = (entry) =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22'),
  })

const departmentPerCompany = 3
const baseUserPerCompany = 10

module.exports = {
  up: function (queryInterface, Sequelize) {
    for (let companyId = 0; companyId < 50; companyId++) {
      const totalUsers = baseUserPerCompany * (companyId + 1)
      const users = [
        ...[...Array(totalUsers)].map((u, index) => ({
          id: totalUsers * companyId + 1 + index,
          name: `Test ${totalUsers * companyId + 1 + index} c 2`,
          companyId: companyId + 1,
          departmentId:
            companyId * departmentPerCompany + 1 + ((index + 1) % 5),
        })),
      ]
      const locations = [
        ...[...Array(departmentPerCompany)].map((u, index) => ({
          id: companyId * departmentPerCompany + 1 + index,
          name: `Location ${companyId * departmentPerCompany + 1 + index} c ${
            companyId + 1
          }`,
          companyId: companyId + 1,
        })),
      ]
      let links = []
      for (const user of users) {
        for (const location of locations) {
          links.push({
            userId: user.id,
            locationId: location.id,
          })
        }
      }
      links = links.map(timestamp) // Add timestamps

      return queryInterface.bulkInsert('userLocation', links, {})
    }
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('userLocation', null, {})
  },
}
