'use strict'
module.exports = function(sequelize, DataTypes) {
  const CompanySetting = sequelize.define(
    'companySetting',
    {
      whiteLabelEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      freezeTableName: true
    }
  )
  CompanySetting.associate = function(models) {
    models.companySetting.belongsTo(models.company)
  }
  return CompanySetting
}
