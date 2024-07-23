# immudb-client


## Intro

The project includes two different apps:
- A react web client, `./apps/client`, that interacts with the go api
- A go api, `./apps/api`, that serves a couple of CRUD operations with additional logic on top of the `immudb valut` service 


In order to check the project locally follow the steps below:

1. Add a `.env` file to the root of the go project with the following content:
```
IMMUDB_API_KEY=
IMMUDB_COLLECTION_NAME=test
IMMUDB_LEDGER_NAME=default
```

2. Run `docker-compose up` from the root of the project

## Go API

This is my first attempt at building a go api. So, probably most of the code doesn't follow best practices.
But the way it's structured kind of maps the way I think of a backend service in terms of a general mental model.
- infrastructure: contains entities that initiate an operation (api controllers, task runners, cron jobs, etc)
- services: the main business logic of the app. isolated from other external concerns. 
- repositories: *this one's not in the project since it felt kind of redundant here. But, If I were to extend this with additional business logic, 
there would probably be an `AccountRepository` that would perform the actual `ImmudbVaultClient` calls in order to isolate even more the persistence layer.


### Routes

#### AddAccountingInformation
- POST /account
- curl example
```bash
curl -X POST http://localhost:8080/account -H "Content-Type: application/json" -d '{"accountNumber":"123456789123","accountName":"Test Account","iban":"IBAN","address":"123 Street","type":"sending","amount":100}'
```
- Sample Request body
```json
{
  "accountNumber": "123456789123",
  "accountName": "Test Account",
  "iban": "IBAN",
  "address": "123 Street",
  "type": "sending",
  "amount": 100
}
```
- Response body
```json
{}
```

#### GetAccountingInformation
- POST /account/search
- curl example
```bash
curl -X POST http://localhost:8080/account/search -H "Content-Type: application/json" -d '{"pagination":{"page":1,"limit":10}}'
```
- Request body
```json
{
  "filters": [
    {
      "field": "accountNumber",
      "operator": "LIKE",
      "value": "123456789123"
    }
  ],
  "sorting": [
    {
      "field": "accountNumber",
      "order": "asc"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

- Response body
```json
{
  "data": {
    "count": 1,
    "rows": [
      {
        "accountNumber": "123456789123",
        "accountName": "Test Account",
        "iban": "IBAN",
        "address": "123 Street",
        "type": "sending",
        "amount": 100
      }
    ]
  }
}
```

#### ResetAccountingInformation
- POST /account/reset
- curl example
```bash
curl -X POST http://localhost:8080/account/reset
```
- Response body
```json
{}
```


## React Client

A simple table with some filtering, pagination and a create form. That's pretty much it.

Most of the flow states are covered:
- The table shows relevant information if there's no data available or if there has been a fetch error
- The create form uses HTML5 form validation and also shows an error message if the api call fails

The code structure is pretty straightforward. Components sit in the `src/components` folder and any additional utilities/services are in the `src/lib` folder. Enough for something this size. 

The app makes use of two main external libraries: 
- [React Query](https://tanstack.com/query/v4) for fetching data/performing mutations and local caching
- [Radix UI](https://www.radix-ui.com/) unstyled components that provide some ui logic and accesibility. 
And the main styling is inspired by the [shadcn ui](https://github.com/shadcn/ui) examples 

