import { Model, ModelStatic, Transaction, TransactionOptions } from 'sequelize'
import { ModelDeclarationType } from '../types/types'

export type MutationAction = 'create' | 'update' | 'delete'

/**
 * What a mutation's body hands back to `runMutation`.
 *
 * `afterCommit` holds the side effects that must only run once the write is
 * durable: pubSub publications and webhooks. When the mutation is
 * transactional it runs after the commit; a subscriber or a webhook never
 * sees a row that then rolls back.
 */
export type MutationOutcome<T> = {
  result: T
  afterCommit?: () => Promise<void> | void
}

/**
 * Whether the action runs inside a transaction.
 *
 * The per-action flag (`create.transactional`, `update.transactional`,
 * `delete.transactional`) wins over the declaration-level one. Both default
 * to `false`: a hook written without a transaction in mind must not be moved
 * inside one silently.
 */
export function isTransactional<M extends Model<any>>(
  graphqlModelDeclaration: ModelDeclarationType<M>,
  action: MutationAction
): boolean {
  const actionDeclaration: any = graphqlModelDeclaration[action]
  if (
    actionDeclaration &&
    typeof actionDeclaration.transactional === 'boolean'
  ) {
    return actionDeclaration.transactional
  }
  return graphqlModelDeclaration.transactional === true
}

/**
 * The options handed to `sequelize.transaction(...)`, per-action first.
 */
export function getTransactionOptions<M extends Model<any>>(
  graphqlModelDeclaration: ModelDeclarationType<M>,
  action: MutationAction
): TransactionOptions {
  const actionDeclaration: any = graphqlModelDeclaration[action]
  if (actionDeclaration && actionDeclaration.transactionOptions) {
    return actionDeclaration.transactionOptions
  }
  return graphqlModelDeclaration.transactionOptions || {}
}

/**
 * Runs the body of a generated mutation, inside one transaction when the
 * declaration asks for it and bare otherwise.
 *
 * `work` receives the transaction (`undefined` when not transactional) and
 * must pass it to every hook and every query it runs. Any throw rolls the
 * transaction back and is rethrown as is: GSG does not retry. A caller who
 * needs retries on serialization failures wraps its own service call inside
 * the hook, with the transaction it is given.
 */
export default async function runMutation<M extends Model<any>, T>(
  model: ModelStatic<M>,
  graphqlModelDeclaration: ModelDeclarationType<M>,
  action: MutationAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  work: (transaction: Transaction | undefined) => Promise<MutationOutcome<T>>
): Promise<T> {
  let outcome: MutationOutcome<T>

  if (isTransactional(graphqlModelDeclaration, action)) {
    const sequelize = model.sequelize
    if (!sequelize) {
      throw new Error(
        `${model.name}: a transactional mutation needs a model bound to a Sequelize instance.`
      )
    }
    outcome = await sequelize.transaction(
      getTransactionOptions(graphqlModelDeclaration, action),
      work
    )
  } else {
    outcome = await work(undefined)
  }

  if (outcome.afterCommit) {
    await outcome.afterCommit()
  }

  return outcome.result
}
