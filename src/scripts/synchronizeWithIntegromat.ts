import axios from 'axios'

import addCreateModule from './addModules/addCreateModule'
import addDeleteModule from './addModules/addDeleteModule'
import addReadModule from './addModules/addReadModule'
import addUpdateModule from './addModules/addUpdateModule'

const addModules: any = {
  read: addReadModule,
  create: addCreateModule,
  update: addUpdateModule,
  delete: addDeleteModule
}

export function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

export default async function synchronizeWithIntegromat(
  models: any,
  token: any,
  appName: string
) {
  // Object.keys(models.sequelize.models).forEach(modelName => {
  for (const modelName in models.sequelize.models) {
    if (models[modelName]) {
      ;['read', 'create', 'update', 'delete'].forEach(async action => {
        const attributes = Object.keys(models[modelName].rawAttributes)
        const config: any = {
          method: 'get',
          url: `https://api.integromat.com/v1/app/${appName}/1/module/${action}${capitalize(
            modelName
          )}`,
          headers: {
            Authorization: `Token ${token}`,
            'x-imt-apps-sdk-version': '1.3.8'
          }
        }
        try {
          const response = await axios(config)
          console.log(`Module "${response.data.label}" already exists.`)
        } catch (error) {
          console.log(JSON.stringify(error))
          if (error.response.data.code === 'IM005') {
            addModules[action](models, modelName, attributes, token, appName)
          }
        }
      })
    }
  }
}
