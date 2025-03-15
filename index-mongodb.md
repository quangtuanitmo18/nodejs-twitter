# Optimize MongoDB

## 1. Index

In MongoDB, an index is a data structure that helps speed up query and sort operations in the database. It works similarly to a bookmark in a book, allowing you to go directly to the desired page without searching from the beginning.

### Advantages of index

The biggest advantage is speeding up queries, thereby reducing response time.

### Disadvantages of index

- Consumes storage space: Indexes create separate index tables, increasing memory usage.

- Takes time when adding, editing, deleting data: When you add, edit, or delete data in indexed fields, MongoDB has to update the related indexes. This process consumes more time and resources compared to not using indexes.

### Limitations of index

A collection can have a maximum of 64 indexes.

A collection can have only 1 text index.

### Some common types of indexes

- Single Field Index: Index on a single field.
- Compound Index: Index on multiple fields.
- Search Index: Index on a field with string data type, used for searching.

## 2. Other optimizations

Besides indexing, here are some tips for further optimization.

- Analyze queries with `explain`.

- Using MongoDB Driver is always faster than using ODMs (ORMs) like Mongoose, Prisma because it bypasses the abstraction layer and queries directly into the database.

- Place the MongoDB server as close to your server as possible.
