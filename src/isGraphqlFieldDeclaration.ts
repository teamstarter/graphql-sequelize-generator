import { GraphQLFieldConfig } from 'graphql'
import { ModelDeclarationType } from '../types'

export function isGraphqlFieldDeclaration(
  declaration: ModelDeclarationType | GraphQLFieldConfig<any, any, any>
): declaration is GraphQLFieldConfig<any, any, any> {
  return (declaration as GraphQLFieldConfig<any, any, any>).type !== undefined
}
