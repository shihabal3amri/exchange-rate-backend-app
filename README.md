# ExchangeRate-API App Readme

This app fetches data from the ExchangeRate-API every 3 minutes and saves conversion rates of Omani Riyal (OMR) to all currencies. It provides various APIs for user authentication, conversion, and retrieval of conversion data.

## APIs

### 1. Signup New User
- **Endpoint:** POST v1/auth/signup/
- **Payload:**
    ```json
    {
        "username": "shihab",
        "email": "shihab@gmail.com",
        "password": "12345678"
    }
    ```
- **Response:**
    ```json
    {
        "id": "<user_id>",
        "username": "shihab",
        "email": "shihab@gmail.com"
    }
    ```

### 2. Login
- **Endpoint:** POST v1/auth/login/
- **Payload:**
    ```json
    {
        "username": "shihab",
        "password": "12345678"
    }
    ```
- **Response:**
    ```json
    {
        "access_token": "<access_token>",
        "refresh_token": "<refresh_token>"
    }
    ```

### 3. Refresh Token
- **Endpoint:** POST v1/auth/refresh/
- **Payload:**
    ```json
    {
        "refresh_token": "<refresh_token>"
    }
    ```
- **Response:**
    ```json
    {
        "access_token": "<new_access_token>",
        "refresh_token": "<new_refresh_token>"
    }
    ```

### 4. Convert Between Currencies
- **Endpoint:** POST v1/exchange-rate/create-user-conversion-rate/
- **Authorization:** Bearer \<access_token\>
- **Payload:**
    ```json
    {
        "fromCurrency": "OMR",
        "toCurrency": "USD",
        "amount": 1
    }
    ```
- **Response:**
    ```json
    {
        "id": "<conversion_id>",
        "userId": "<user_id>",
        "fromCurrency": "OMR",
        "toCurrency": "USD",
        "amount": 1,
        "rate": 2.6008,
        "timestamp": "2024-03-06T20:45:41.278Z",
        "updatedAt": "2024-03-06T20:45:41.278Z"
    }
    ```

### 5. Fetch User Conversion Rates
- **Endpoint:** GET v1/exchange-rate/get-user-conversion-rates/
- **Authorization:** Bearer \<access_token\>
- **Payload:**
    ```json
    {
        "take": 2,
        "skip": 0
    }
    ```
- **Response:**
    ```json
    [
        {
            "id": "<conversion_id>",
            "userId": "<user_id>",
            "fromCurrency": "OMR",
            "toCurrency": "EUR",
            "amount": 1,
            "rate": 2.3962,
            "timestamp": "2024-03-06T21:31:49.528Z",
            "updatedAt": "2024-03-06T21:31:49.528Z"
        },
        {
            "id": "<conversion_id>",
            "userId": "<user_id>",
            "fromCurrency": "OMR",
            "toCurrency": "USD",
            "amount": 1,
            "rate": 2.6008,
            "timestamp": "2024-03-06T20:45:41.278Z",
            "updatedAt": "2024-03-06T20:45:41.278Z"
        }
    ]
    ```

### 6. Fetch OMR Conversion Rates
- **Endpoint:** GET v1/exchange-rate/get-omr-saved-conversion-rates/
- **Authorization:** Bearer \<access_token\>
- **Payload:**
    ```json
    {
        "take": 10,
        "skip": 0
    }
    ```
- **Response:**
    ```json
    [
        {
            "id": "<conversion_id>",
            "fromCurrency": "OMR",
            "toCurrency": "ZWL",
            "rate": 40698.5467,
            "timestamp": "2024-03-06T21:36:00.448Z",
            "updatedAt": "2024-03-06T21:36:00.448Z"
        },
        {
            "id": "<conversion_id>",
            "fromCurrency": "OMR",
            "toCurrency": "ZMW",
            "rate": 61.8994,
            "timestamp": "2024-03-06T21:36:00.448Z",
            "updatedAt": "2024-03-06T21:36:00.448Z"
        },
        {
            "id": "<conversion_id>",
            "fromCurrency": "OMR",
            "toCurrency": "ZAR",
            "rate": 49.3646,
            "timestamp": "2024-03-06T21:36:00.448Z",
            "updatedAt": "2024-03-06T21:36:00.448Z"
        },
        {
            "id": "<conversion_id>",
            "fromCurrency": "OMR",
            "toCurrency": "YER",
            "rate": 650.8704,
            "timestamp": "2024-03-06T21:36:00.448Z",
            "updatedAt": "2024-03-06T21:36:00.448Z"
        },
        {
            "id": "<conversion_id>",
            "fromCurrency": "OMR",
            "toCurrency": "XPF",
            "rate": 285.9454,
            "timestamp": "2024-03-06T21:36:00.448Z",
            "updatedAt": "2024-03-06T21:36:00.448Z"
        }
    ]
    ```

## Requirements
- Node.js
- PostgreSQL
- ExchangeRate-API

## How to Run the Project for the First Time
1. Rename `.env_` to `.env` and fill the required fields:
    ```
    DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<db>"
    EXCHANGE_RATE_BASE_URL="https://v6.exchangerate-api.com/v6/<your-api-key>"
    ACCESS_TOKEN_SECRET="some_secret_for_access_tokens"
    REFRESH_TOKEN_SECRET="different_secret_for_refresh_tokens"
    ```

2. Run `npm i` to install the packages.
3. Run `npx prisma migrate dev` to run the migration file and create the required tables in PostgreSQL.
4. Run `npm run prisma:seed` to run the required seed for fetching the conversion rates of Omani Riyal (OMR) to all currencies every 3 minutes.
5. Run `npm run start:dev` to start the app.

## How to Run the Project in docker

## Requirements
- PostgreSQL
- ExchangeRate-API

### Pull the Image
```bash
docker pull shihabal3amri/exchange-rate-backend-app
```
### Linux and macOS (Bash):
```bash
docker run --name my-container \
    -e DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<db>" \
    -e EXCHANGE_RATE_BASE_URL="https://v6.exchangerate-api.com/v6/<your-api-key>" \
    -e ACCESS_TOKEN_SECRET="some_secret_for_access_tokens" \
    -e REFRESH_TOKEN_SECRET="different_secret_for_refresh_tokens" \
    -p 3000:3000 \
    shihabal3amri/exchange-rate-backend-app
```

### Windows (CMD):
```cmd
docker run --name my-container ^
    -e DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<db>" ^
    -e EXCHANGE_RATE_BASE_URL="https://v6.exchangerate-api.com/v6/<your-api-key>" ^
    -e ACCESS_TOKEN_SECRET="some_secret_for_access_tokens" ^
    -e REFRESH_TOKEN_SECRET="different_secret_for_refresh_tokens" ^
    -p 3000:3000 ^
    shihabal3amri/exchange-rate-backend-app
```

### Windows (Powershell):
```powershell
docker run --name my-container `
    -e DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<db>" `
    -e EXCHANGE_RATE_BASE_URL="https://v6.exchangerate-api.com/v6/<your-api-key>" `
    -e ACCESS_TOKEN_SECRET="some_secret_for_access_tokens" `
    -e REFRESH_TOKEN_SECRET="different_secret_for_refresh_tokens" `
    -p 3000:3000 `
    shihabal3amri/exchange-rate-backend-app
```

