'use strict'
const timestamp = entry =>
  Object.assign(entry, {
    createdAt: entry.createdAt || new Date('2007-07-12 00:04:22'),
    updatedAt: new Date('2007-07-12 00:04:22')
  })

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      'companySetting',
      [
        {
          id: 1,
          companyId: 1,
          whiteLabelEnabled: 1
        },
        {
          id: 2,
          companyId: 2,
          whiteLabelEnabled: 0
        }
      ].map(timestamp),
      {}
    )
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('companySetting', null, {})
  }
}
