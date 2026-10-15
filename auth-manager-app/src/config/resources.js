/**
 * Subtrees the Manage page leaves out of the resource list.
 *
 * Everything else in arborist is listed, so nothing needs adding when a new
 * top-level resource appears. A path here still shows up itself, but nothing
 * beneath it does. List a path only when its subtree is too big to show or to
 * pick from: dev has about 2.5 million resources, nearly all beneath
 * /programs/pcdc, and listing them in full takes arborist minutes.
 */
export const EXCLUDED_RESOURCE_SUBTREES = ['/programs/pcdc'];
