import {
  Action,
  GraphqlSchemaDeclarationType,
  MutationList,
} from './types/types'

/**
 * Keys describing write surface or live connections. A profile is a restricted
 * view, and there is no vocabulary yet for restricting these individually, so
 * they are dropped wholesale rather than half-filtered.
 */
const DROPPED_IN_PROFILES = [
  'additionalMutations',
  'additionalSubscriptions',
  'subscriptions',
  'webhooks',
]

/**
 * Build the declaration for one named profile.
 *
 * Endpoints that do not declare the profile are dropped, which also prunes them
 * from the type graph: `injectAssociations` skips associations whose target
 * model is absent from the declaration, so a dropped endpoint is unreachable
 * through nesting too, not merely absent from the root.
 *
 * Accepts a customMutations map as well as a schema declaration: those entries
 * carry no `model` and take the custom-endpoint branch.
 *
 * Pure: the source declaration is never mutated.
 */
export function filterDeclarationByProfile<
  T extends GraphqlSchemaDeclarationType | MutationList
>(sourceDeclaration: T, profileName: string): T {
  const filtered: any = {}

  for (const key of Object.keys(sourceDeclaration)) {
    const declaration = (sourceDeclaration as any)[key] as any

    const profile =
      declaration && declaration.profiles
        ? declaration.profiles[profileName]
        : undefined

    if (!profile) {
      continue
    }

    const { profiles, ...rest } = declaration

    // Custom endpoints are GraphQLFieldConfig: no model, no actions to filter.
    if (!declaration.model) {
      filtered[key] = rest
      continue
    }

    const declaredActions: Action[] = declaration.actions || []
    const profileActions: Action[] = profile.actions || []

    const undeclared = profileActions.filter(
      (action: Action) => !declaredActions.includes(action)
    )

    if (undeclared.length > 0) {
      throw new Error(
        `Profile "${profileName}" of endpoint "${key}" declares action(s) ` +
          `[${undeclared.join(', ')}] that the endpoint itself does not ` +
          `declare [${declaredActions.join(', ')}]. Either add them to the ` +
          `endpoint's actions or remove them from the profile.`
      )
    }

    const entry: any = { ...rest, actions: profileActions }

    if (profile.excludeFromRoot !== undefined) {
      entry.excludeFromRoot = profile.excludeFromRoot
    }

    for (const dropped of DROPPED_IN_PROFILES) {
      delete entry[dropped]
    }

    filtered[key] = entry
  }

  return filtered as T
}
