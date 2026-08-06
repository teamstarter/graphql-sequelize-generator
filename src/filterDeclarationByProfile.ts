import {
  Action,
  Event,
  GraphqlSchemaDeclarationType,
  MutationList,
  SubscriptionList,
  WebhookType,
} from './types/types'

/**
 * Keep the entries of a named map that declare the profile, stripping the
 * `profiles` key from each survivor.
 *
 * Returns `undefined` rather than `{}` when nothing survives: `generateSchema`
 * reads a present `additionalMutations` as proof that mutations exist, so an
 * empty one would build an invalid empty `Root_Mutations` type.
 */
function filterNamedEntries<T extends MutationList | SubscriptionList>(
  entries: T | undefined,
  profileName: string
): T | undefined {
  if (!entries) {
    return undefined
  }

  const kept: any = {}

  for (const key of Object.keys(entries)) {
    const entry = (entries as any)[key]

    if (!entry || !entry.profiles || !entry.profiles[profileName]) {
      continue
    }

    const { profiles, ...rest } = entry
    kept[key] = rest
  }

  return Object.keys(kept).length > 0 ? (kept as T) : undefined
}

/**
 * A profile may only narrow. Asking for something the endpoint does not itself
 * declare is a typo or a stale profile, and failing at build time is cheaper
 * than shipping an endpoint nobody reviewed.
 */
function assertSubset(
  kind: string,
  endpointKey: string,
  profileName: string,
  requested: string[],
  declared: string[]
) {
  const undeclared = requested.filter(value => !declared.includes(value))

  if (undeclared.length === 0) {
    return
  }

  throw new Error(
    `Profile "${profileName}" of endpoint "${endpointKey}" declares ` +
      `${kind} [${undeclared.join(', ')}] that the endpoint itself does not ` +
      `declare [${declared.join(', ')}]. Either add them to the endpoint's ` +
      `${kind} or remove them from the profile.`
  )
}

/** Set the key when the profile asked for something, remove it otherwise. */
function setOrDelete(entry: any, key: string, value: any) {
  if (value === undefined || (Array.isArray(value) && value.length === 0)) {
    delete entry[key]
    return
  }

  entry[key] = value
}

/**
 * Build the declaration for one named profile.
 *
 * Endpoints that do not declare the profile are dropped, which also prunes them
 * from the type graph: `injectAssociations` skips associations whose target
 * model is absent from the declaration, so a dropped endpoint is unreachable
 * through nesting too, not merely absent from the root.
 *
 * Everything is opt-in. `actions`, `subscriptions` and `webhooks` are taken
 * from the profile and default to none; `additionalMutations` and
 * `additionalSubscriptions` keep only the entries carrying the profile in their
 * own `profiles` key.
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

    const profileActions: Action[] = profile.actions || []
    const profileSubscriptions: Event[] = profile.subscriptions || []
    const profileWebhooks: WebhookType[] = profile.webhooks || []

    assertSubset(
      'actions',
      key,
      profileName,
      profileActions,
      declaration.actions || []
    )
    assertSubset(
      'subscriptions',
      key,
      profileName,
      profileSubscriptions,
      declaration.subscriptions || []
    )
    assertSubset(
      'webhooks',
      key,
      profileName,
      profileWebhooks,
      declaration.webhooks || []
    )

    const entry: any = { ...rest, actions: profileActions }

    setOrDelete(entry, 'subscriptions', profileSubscriptions)
    setOrDelete(entry, 'webhooks', profileWebhooks)
    setOrDelete(
      entry,
      'additionalMutations',
      filterNamedEntries(declaration.additionalMutations, profileName)
    )
    setOrDelete(
      entry,
      'additionalSubscriptions',
      filterNamedEntries(declaration.additionalSubscriptions, profileName)
    )

    if (profile.excludeFromRoot !== undefined) {
      entry.excludeFromRoot = profile.excludeFromRoot
    }

    filtered[key] = entry
  }

  return filtered as T
}
