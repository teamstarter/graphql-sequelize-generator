'use strict'
module.exports = function (sequelize, DataTypes) {
  const UserLocation = sequelize.define(
    'userLocation',
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      freezeTableName: true,
    }
  )

  UserLocation.associate = function (models) {
    // associations can be defined here
    models.userLocation.belongsTo(models.user)
    models.userLocation.belongsTo(models.location)
  }
  return UserLocation
}
