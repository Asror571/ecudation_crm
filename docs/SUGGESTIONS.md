# Suggestions and Specification Gaps

No product features beyond [the TZ](./TZ.md) are proposed or implemented.
Implementation decisions needed to complete the contract are tracked here
until the relevant milestone:

| Open implementation question                                                                                          | Planned handling                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial owner/user provisioning and safe operator/sales-head test accounts are not defined by the current foundation. | Define the simplest secure bootstrap flow during M1, document it in the package/setup guides, and keep it outside public registration unless required by the TZ. |
| No standalone `docs/design/` screens were supplied with the specification.                                            | Use the TZ's textual screen anatomy, design tokens, and UX requirements; do not infer missing screens or add product behavior.                                   |
