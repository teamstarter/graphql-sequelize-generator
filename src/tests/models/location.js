'use strict'
module.exports = function(sequelize, DataTypes) {
  const Location = sequelize.define(
    'location',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  )

  Location.associate = function(models) {
    models.location.belongsTo(models.company)
  }
  return Location
}
