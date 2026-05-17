# FrontEnd

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Run with backend in dev mode (recommended)

This frontend is configured to call backend API directly at `http://localhost:8080/api/v1` in development.

1) Start backend (`backend/`):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

2) Start this frontend (`front-end/`):

```bash
npm install
npx ng serve --configuration development --port 4200
```

3) Open:

- `http://localhost:4200`

## Interactive Tour

- The citizen header includes a `Guia` button that launches an interactive Intro.js tour.
- Current guided steps cover navigation menu, language selector, login access, and help entry point.

If proxy or environment settings change, restart `ng serve`.

## Procedure Start Flow (Auth + Continuity)

- Procedure start uses stable `procedureId` (UUID) routing.
- Start navigation goes to protected wizard route: `/expedientes/nuevo/:procedureId`.
- If the user is not authenticated, guard redirects to `/sede/login?returnUrl=...`.
- After successful login, navigation resumes to the original wizard route automatically.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
