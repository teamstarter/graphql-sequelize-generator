'use strict'
module.exports = function (sequelize, DataTypes) {
  const Company = sequelize.define(
    'company',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Name of the company.',
      },
      companyTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Which type is the company.',
      },
      managerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Who is the manager of the company.',
      },
      userCount: {
        type: DataTypes.VIRTUAL(DataTypes.INTEGER, [
          [
            sequelize.literal(
              `(SELECT COALESCE(COUNT("user".id), 0) FROM "user" WHERE "user"."companyId" = "company".id)`
            ),
            'userCount',
          ],
        ]),
      },
    },
    {
      freezeTableName: true,
    }
  )

  Company.associate = function (models) {
    models.company.hasMany(models.user)
    models.company.hasMany(models.department)
    models.company.hasMany(models.location, {
      as: 'spaces',
    })
    models.company.belongsTo(models.companyType, {
      as: 'type',
      foreignKey: 'companyTypeId',
    })
    models.company.hasOne(models.companySetting, {
      as: 'settings',
      foreignKey: 'companyId',
    })
    models.company.belongsTo(models.user, {
      as: 'manager',
      otherKey: 'managerId',
    })
    models.company.belongsToMany(models.tag, {
      as: 'tags',
      through: 'tagCompanyLink',
      foreignKey: 'companyId',
      otherKey: 'tagId',
    })
  }
  return Company
}
