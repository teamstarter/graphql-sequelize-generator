'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

const userPerCompany = 250

module.exports = {
  up: function (queryInterface, Sequelize) {
    let users = []
    let a = [...Array(50)].map((c, companyId) => {
      users = [
        ...users,
        ...[...Array(userPerCompany)].map((u, index) => ({
          id: userPerCompany * companyId + 1 + index,
          name: `Test ${userPerCompany * companyId + 1 + index} c 2`,
          companyId: companyId + 1,
          departmentId: companyId + 1 + (index + 1) % 5
        }))
      ]
    })

    users = users.map(timestamp) // Add timestamps

    return queryInterface.bulkInsert('user', users, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user', null, {})
  }
}
