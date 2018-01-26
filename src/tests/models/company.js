'use strict'
module.exports = function (sequelize, DataTypes) {
  var Company = sequelize.define(
    'company',
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

  Company.associate = function (models) {
    models.company.hasMany(models.user)
  }
  return Company
}
