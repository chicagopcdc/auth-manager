# Authentication Manager

A web app for PCDC admins to see and manage access in a Gen3 environment (e.g. `https://portal-dev.pedscommons.org`). It talks to the environment's fence admin API, which in turn talks to arborist.

It uses Vite with the JavaScript variant of React. The app lives in `auth-manager-app/`.

## Pages

| Page | What it is for |
|---|---|
| **Users** | Lists registered users and their roles. Click a user to set their permissions. |
| **Clients** | Lists fence clients. Click a client to set its permissions. "Create Client" adds a fence client that arborist doesn't know about yet. |
| **Permissions** | Assigns existing policies to the user or client you picked. |
| **Manage** | Defines what access exists: create and delete policies ("permissions"), roles and resources. Assigning access to a person happens on the other pages. |

On **Manage**:

- Deleting a role that policies still use is refused, and the policies are named. You can then choose to delete it anyway, which removes the role from those policies. A policy left with no roles grants nothing.
- The Resources tab leaves out some subtrees (see [Configuration](#configuration)).

## Prerequisites

- Node.js 20.19 or later (Vite 7 requires it; the deploy workflow uses Node 20)
- npm
- A login with fence admin rights (`/services/fence/admin`) in the environment you want to manage

## Getting started

Run these from `auth-manager-app/`:

```
npm install     # the first time you open the repo
npm run dev     # start the development server
npm run build   # production build into dist/
```

If the screen goes blank, refresh the page and the error will resolve.

## Logging in

The Login page asks for an environment and an authentication key, which is the `access_token`.

To get it, log in to your domain, then open the browser developer tools -> Application and copy the `access_token` cookie value.

The app keeps your login for 20 minutes. The key itself can expire sooner. When it does, the app sends you back to the Login page with a message.

## Configuration

**Environments.** The `ENVIRONMENTS` list in `auth-manager-app/src/components/Login/Login.jsx` sets what the Login page offers. Entries are host names without `https://`, for example `portal-dev.pedscommons.org`. In development builds only, `localhost:8443` is added so you can point the app at a locally run admin API. It is not in production builds.

**Resource subtrees to leave out.** `EXCLUDED_RESOURCE_SUBTREES` in `auth-manager-app/src/config/resources.js` lists resource paths whose children the Manage page does not load. Everything else in arborist is listed. Dev has about 2.5 million resources, nearly all under `/programs/pcdc`, and listing them all takes arborist minutes, so that path is excluded: it still appears, but nothing beneath it does. Resources under an excluded path can't be picked or deleted from this app. Add a path to the list only when its subtree is too big to show.

## What the Manage page needs from the backend

The Manage page calls these fence admin endpoints (`https://<environment>/user/admin/...`):

- `list_policies?expand=True`, `list_roles`, `list_resources?exclude=<path>`
- `add_policy`, `add_role`, `add_resource`
- `remove_policy/<id>`, `remove_role/<id>[?force=true]`, `remove_resource/<path>`

`list_resources?exclude=` only has an effect when both fence and arborist support `exclude`. Against older versions the parameter is ignored and the full list is requested, which times out on a large tree.

## Troubleshooting

**Blank screen.** Refresh the page.

**"Your authentication key has expired" or a redirect to Login.** The key expired. Log in again with a fresh `access_token`.

**"The server did not respond in time".** The request took longer than 15 seconds. Your key may have expired, or the service may be restarting. Log in again and retry. If it keeps happening on the Resources tab, check that fence and arborist support `exclude` (see above).

**"Could not load ..." on the Manage page.** One of the lists failed to load. What is shown may be incomplete. Use the Retry button.

## Deployment

Pushing to `main` with changes under `auth-manager-app/` runs `.github/workflows/deploy-react-s3.yml`, which builds the app and syncs it to S3, then invalidates CloudFront. The infrastructure is in `terraform/`; see `terraform/README.md` for setup and the GitHub secrets the workflow needs.
