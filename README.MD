# immudb-client

Routes
- POST /auth/register
- POST /auth/login

- POST /account
- GET /account

Pages
- register
- login
- transactions (add transaction will be a modal)

Services
- react client
- go backend
- immudb
- postgresql db for storing users

Other stuff to have in mind when building the app
- cache between api and immudb
- cache between client and api
- figure out how to ensure uniquness of account numbers
- rate limit the immudb calls
- rate limit the api calls
- maybe add some tests to check the correctness of the routes and some edge cases


## Tasks
- [x] Add the initial project
- [] Add the immudb routes 
- [] Add the login routes  
- [] Add the react client
- [] Initial docker setup
- [] Deploy to some cloud provider
- [] Refined the api (rate limiting/caching/testing) 

