'use strict'
module.exports = function(sequelize, DataTypes) {
  const CompanyType = sequelize.define(
    'companyType',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    },
    {
      freezeTableName: true
    }
  )
  return CompanyType
}
