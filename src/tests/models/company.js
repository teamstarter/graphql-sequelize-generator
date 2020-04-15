'use strict'
module.exports = function (sequelize, DataTypes) {
  var Company = sequelize.define(
    'company',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      companyTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userCount: {
        type: DataTypes.VIRTUAL(DataTypes.INTEGER, [
          [
            sequelize.literal(
              `(SELECT COALESCE(COUNT("user".id), 0) FROM "user" WHERE "user"."companyId" = "company".id)`
            ),
            'userCount'
          ]
        ])
      }
    },
    {
      freezeTableName: true
    }
  )

  Company.associate = function (models) {
    models.company.hasMany(models.user)
    models.company.hasMany(models.department)
    models.company.belongsTo(models.companyType, {
      as: 'type',
      foreignKey: 'companyTypeId'
    })
    models.company.hasOne(models.companySetting, {
      as: 'settings',
      foreignKey: 'companyId'
    })
    models.company.belongsToMany(models.tag, {
      as: 'tags',
      through: 'tagCompanyLink',
      foreignKey: 'companyId',
      otherKey: 'tagId'
    })
  }
  return Company
}
