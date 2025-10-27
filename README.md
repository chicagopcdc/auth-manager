# Authentication Manager

This app displays registered users' roles for a selected domain (e.g. `https://portal-dev.pedscommons.org`), and allows admins to manage permissions for users.

This app uses vite with the Javascript variant of React.

## Getting Started

`npm install` when opening the repo for the first time

`npm run dev` to start the development server

If the screen goes blank, please refresh the page and the error will resolve.

The Login page requires the authentication key, which is the `access_token`, found in the developer console -> Application while you are logged into your domain.

The authentication manager times out every 20 minutes when your authentication key expires.

To change the available environments, modify the `ENVIRONMENTS` variable in `Login.jsx`.

