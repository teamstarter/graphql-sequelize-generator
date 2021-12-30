import axios from 'axios'
import { capitalize } from '../synchronizeWithIntegromat'

export default function addUpdateModule(
  models: any,
  modelName: string,
  attributes: any,
  token: any,
  appName: string
) {
  const variable: any = {}
  let returnAttrinutes = ''
  attributes.forEach((attribute: any) => {
    if (
      models[modelName].rawAttributes[attribute].type.constructor.key !==
      'VIRTUAL'
    ) {
      variable[attribute] = `{{${attribute}}}`
    }
    returnAttrinutes += `${attribute}\n    `
  })

  const data = JSON.stringify({
    name: `update${capitalize(modelName)}`,
    label: `Update ${capitalize(modelName)}`,
    type_id: 4,
    crud: 'update',
    description: `The update endpoint for the ${capitalize(modelName)}`
  })

  const config: any = {
    method: 'post',
    url: `https://api.integromat.com/v1/app/${appName}/1/module`,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      'x-imt-apps-sdk-version': '1.0.0'
    },
    data: data
  }

  axios(config)
    .then(function(response) {
      console.log(JSON.stringify(response.data))

      const queryString = JSON.stringify({
        url: '/platform/graphql',
        method: 'POST',
        qs: {},
        body: {
          operationName: `update${capitalize(modelName)}`,
          variables: {
            [modelName]: variable
          },
          query: `mutation update${capitalize(
            modelName
          )}($${modelName}: ${modelName}Input!) {\n  ${modelName}Update(${modelName}: $${modelName}) {\n    ${returnAttrinutes}__typename\n  }\n}\n`
        },
        headers: {
          authorization: '{{connection.token}}'
        },
        response: {
          output: '{{body}}'
        }
      })

      const configApi: any = {
        method: 'put',
        url: `https://api.integromat.com/v1/app/${appName}/1/module/update${capitalize(
          modelName
        )}/api`,
        headers: {
          Authorization: `Token ${token}`,
          'x-imt-apps-sdk-version': '1.0.0',
          'Content-Type': 'application/jsonc'
        },
        data: queryString
      }

      axios(configApi)
        .then(function(response) {
          console.log(JSON.stringify(response.data))
        })
        .catch(function(error) {
          console.log(JSON.stringify(error))
        })

      const parameters = Object.keys(variable).map(attribute => {
        const attributeObject = models[modelName].rawAttributes[attribute]
        const parameter: any = {
          name: attribute,
          type: models[modelName].rawAttributes[attribute].type.constructor.key,
          label: capitalize(attribute),
          required:
            attribute === 'id'
              ? true
              : !models[modelName].rawAttributes[attribute].allowNull
        }

        if (attributeObject.validate && attributeObject.validate.isIn) {
          parameter['type'] = 'select'
          parameter['options'] = attributeObject.validate.isIn[0].map(
            (valid: any) => ({
              label: String(valid),
              value: valid
            })
          )
        }
        return parameter
      })

      const configExpect: any = {
        method: 'put',
        url: `https://api.integromat.com/v1/app/${appName}/1/module/update${capitalize(
          modelName
        )}/expect`,
        headers: {
          Authorization: `Token ${token}`,
          'x-imt-apps-sdk-version': '1.0.0',
          'Content-Type': 'application/jsonc'
        },
        data: JSON.stringify(parameters)
      }

      axios(configExpect)
        .then(function(response) {
          console.log(JSON.stringify(response.data))
        })
        .catch(function(error) {
          console.log(JSON.stringify(error))
        })
    })
    .catch(function(error) {
      console.log(JSON.stringify(error))
    })
}
