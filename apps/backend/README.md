Of course. Here is a `README.md` file explaining how to run the service locally.

# Dumbbell Service

This document outlines the steps to run the Dumbbell service on a local machine for development purposes.

## Prerequisites

Before you begin, ensure you have the following installed:
*   JDK 21 or newer
*   Docker and Docker Compose

## Running the Application

Follow these steps to get the application running.

### 1. Start the Database

The project uses Docker to run a MariaDB database. To start it, open a terminal in the project's root directory and run:

```bash
docker compose up -d
```

This command will download the MariaDB image (if not already present) and start the database container in detached mode.

### 2. Run the Spring Boot Application

You can run the application using either Gradle or your IDE.

#### Using the Gradle Wrapper

In your terminal, execute the following command:

```bash
./gradlew bootRun
```

The application will start and connect to the database container.

#### Using IntelliJ IDEA

1.  Open the project in IntelliJ IDEA.
2.  Locate the `DumbbellApplication.kt` file in `src/main/kotlin/de/pumpedfitness/dumbbell/`.
3.  Click the green play button next to the `main` function to run the application.

### 3. Accessing the Service

Once the application has started successfully, it will be accessible at `http://localhost:8080`.