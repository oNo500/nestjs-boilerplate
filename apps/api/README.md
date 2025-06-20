# NestJS API

This project is the NestJS API application within the monorepo, named `api`.

## Running

1.  **Configure Environment**
    In the `apps/api` directory, create and configure your own `.env` file based on the `.env.example` file. This includes setting up database connections, and JWT secrets.

2.  **Start the Service**
    Execute the following command to start the development server with watch mode enabled:
    ```bash
    npm start
    ```
    By default, the application will run on port `3000`.

## Common Commands

* **`npm run build`**: Creates a production build for the API.
* **`npm run lint`**: Lints and fixes the code in the project.
* **`npm run test`**: Runs the unit tests.