'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

const baseUserPerCompany = 10
const departmentPerCompany = 5

module.exports = {
  up: function (queryInterface, Sequelize) {
    let users = []
    for (let companyId = 0; companyId < 50; companyId++) {
      const totalUsers = baseUserPerCompany * (companyId + 1)
      users = [
        ...users,
        ...[...Array(totalUsers)].map((u, index) => ({
          id: totalUsers * companyId + 1 + index,
          name: `Test ${totalUsers * companyId + 1 + index} c 2`,
          companyId: companyId + 1,
          departmentId: companyId * departmentPerCompany + 1 + ((index + 1) % 5)
        }))
      ]
    }

    users = users.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('user', users, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user', null, {})
  }
}
