import axios from 'axios'
import { capitalize } from '../synchronizeWithIntegromat'

export default function addReadModule(
  models: any,
  modelName: string,
  attributes: any,
  token: any
) {
  let returnAttrinutes = ''
  attributes.forEach((attribute: any) => {
    returnAttrinutes += `${attribute}\n    `
  })

  const data = JSON.stringify({
    name: `read${capitalize(modelName)}`,
    label: `Read ${capitalize(modelName)}`,
    type_id: 4,
    crud: 'read',
    description: `The read endpoint for the ${capitalize(modelName)}`
  })

  const config: any = {
    method: 'post',
    url: `https://api.integromat.com/v1/app/test-app-894954/1/module`,
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
          operationName: modelName,
          variables: {
            where: '{{where}}'
          },
          query: `query read${capitalize(
            modelName
          )}($where: SequelizeJSON!) {\n  ${modelName}(where: $where) {\n    ${returnAttrinutes}__typename\n  }\n}\n`
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
        url: `https://api.integromat.com/v1/app/test-app-894954/1/module/read${capitalize(
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
          console.log(error)
        })

      const parameters = [
        {
          name: 'where',
          type: 'json',
          label: 'Where',
          required: true
        }
      ]

      const configExpect: any = {
        method: 'put',
        url: `https://api.integromat.com/v1/app/test-app-894954/1/module/read${capitalize(
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
          console.log(error)
        })
    })
    .catch(function(error) {
      console.log(error)
    })
}
