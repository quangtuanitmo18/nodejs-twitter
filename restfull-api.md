# REST

## What is REST?

**REST** stands for **RE**presentational **S**tate **T**ransfer, a convention of rules for designing networked systems.

REST helps clients interact with servers without needing to know how the server works.

REST has some constraints:

- **Uniform Interface**

- **Stateless**

- **Cacheable**

- **Client-Server**

- **Layered System**

- **Code on Demand**

## What is an API?

**API** is a mechanism that allows two software components to communicate with each other using a set of definitions and protocols.

**Example**: A weather agency's software system contains daily weather data. The weather app on your phone "talks" to this system via an API and displays daily weather updates on your phone.

## What is a RESTful API?

**RESTful API** is a REST-compliant API. The REST standard is quite academic and hard to understand, so your API can be considered RESTful if it applies the following techniques.

### Use HTTP methods meaningfully

- **GET**: Read a resource
- **PUT**: Update a resource
- **DELETE**: Delete a resource
- **POST**: Create a new resource

### Provide meaningful resource names

Creating a great API is 80% art and 20% science.
Example:

- Use identifiers in the URL instead of query strings. Use URL query strings for filtering, not for retrieving a resource.

  - **Good**: `/users/123`
  - **Poor**: `/api?type=user&id=23`

- Design for users, not for your data

- Keep URLs short and readable for clients

- Use plural nouns in URLs for consistency
  - **Should use**: `/customers/33245/orders/8769/lineitems/1`
  - **Should not use**: `/customer/33245/order/8769/lineitem/1`

### Use HTTP response codes to indicate the status of the API response

- **200 OK**: Success
- **201 CREATED**: Successfully created (can be from POST or PUT method)
- **204 NO CONTENT**: Success but no content in the body, often used for DELETE or PUT
- **400 BAD REQUEST**: Error, possibly due to validation error, missing data, etc.
- **401 UNAUTHORIZED**: Error related to missing or incorrect authentication token
- **403 FORBIDDEN**: Error related to lack of access rights
- **404 NOT FOUND**: Error related to resource not found
- **405 METHOD NOT ALLOWED**: Error related to method not allowed. For example, if the API only allows GET, PUT, DELETE but you use POST, this error will be returned.
- **500 INTERNAL SERVER ERROR**: Error related to the server failing to process a task (the server did not intentionally return this error to you)

### Use JSON or XML format for client-server communication

**JSON** is a convenient data format for server and client communication.

You can use **XML**, but **JSON** is more popular.
