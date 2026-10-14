# FuelPoint API — Postman Complete Testing Guide

This guide contains everything you need to test all CRUD APIs for **Groups**, **Customers**, and **Workers** in Postman, including correct test sequences, valid values, headers, and request bodies.

---

## 1. Postman Setup

### Base URL
All API requests use:
```text
http://localhost:4000
```

### Headers
For every `POST` and `PUT` request, ensure this header is set in Postman:
- **`Content-Type`**: `application/json`

---

## 2. Recommended Testing Order

Always follow this order so you have existing records to fetch, update, and delete:
1. **Groups** (Create Group → Get Groups → Update Group → Delete Group)
2. **Customers** (Create Customer → Get Customers → Update Customer → Delete Customer)
3. **Workers** (Create Worker → Get Workers → Update Worker → Delete Worker)

---

# 📁 MODULE 1: GROUPS (CRUD)

### 1.1 Create Group (`POST`)
Creates a new customer tier group.
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/groups`
- **Body (`raw` -> `JSON`)**:
```json
{
  "id": "grp-vip",
  "name": "VIP Club",
  "discount_percentage": 5.00,
  "description": "Exclusive VIP customer tier",
  "is_default": false,
  "active": true
}
```
- **Expected Status**: `201 Created`

---

### 1.2 Get All Groups (`GET`)
Fetches all groups and their current member counts.
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/groups`
- **Body**: None
- **Expected Status**: `200 OK`

---

### 1.3 Update Group (`PUT`)
Updates an existing group. *(Make sure the ID in the URL exists in the database).*
- **Method**: `PUT`
- **URL**: `http://localhost:4000/api/groups/grp-vip`
- **Body (`raw` -> `JSON`)**:
```json
{
  "name": "VIP Club Gold",
  "discount_percentage": 7.50,
  "description": "Updated exclusive VIP tier",
  "is_default": false,
  "active": true
}
```
- **Expected Status**: `200 OK`

---

### 1.4 Delete Group (`DELETE`)
Deletes a group.
- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/groups/grp-vip`
- **Expected Status**: `200 OK`
- *(Note: You cannot delete `grp-default`)*

---

# 📁 MODULE 2: CUSTOMERS (CRUD)

### 2.1 Create Customer (`POST`)
Creates a new customer.
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/customers`
- **Body (`raw` -> `JSON`)**:
```json
{
  "name": "Aarav Sharma",
  "phone": "+91 9876543210",
  "email": "aarav.sharma@example.com",
  "vehicle": "MH 12 AB 1234",
  "password": "password123",
  "group_id": "grp-default",
  "status": "active"
}
```
- **Expected Status**: `201 Created`
- *(Note: Take note of the `id` returned in the response, e.g., `CUS-01`, `CUS-1001` or generated ID)*

---

### 2.2 Get Customers List (`GET`)
Retrieves all customers with optional pagination, search, and filtering.
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/customers`
- **Query Parameters (Optional)**:
  - `page`: `1`
  - `limit`: `10`
  - `search`: `Aarav`
  - `status`: `active` *(options: `active`, `inactive`, `suspended`)*
- **Expected Status**: `200 OK`

---

### 2.3 Update Customer (`PUT`)
Updates customer details.
- **Method**: `PUT`
- **URL**: `http://localhost:4000/api/customers/<CUSTOMER_ID>` *(e.g. `http://localhost:4000/api/customers/CUS-01`)*
- **Body (`raw` -> `JSON`)**:
```json
{
  "name": "Aarav Sharma (Updated)",
  "phone": "+91 9876543210",
  "email": "aarav.sharma@example.com",
  "vehicle": "MH 12 AB 9999",
  "group_id": "grp-default",
  "status": "active"
}
```
- **Expected Status**: `200 OK`

---

### 2.4 Delete Customer (`DELETE`)
Deletes a customer by ID.
- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/customers/<CUSTOMER_ID>`
- **Expected Status**: `200 OK`

---

# 📁 MODULE 3: WORKERS (CRUD)

> ⚠️ **Important Field Constraints for Workers**:
> - **`status`** must be one of: `"active"`, `"offline"`, `"suspended"`
> - **`shift`** can be: `"Morning"`, `"Evening"`, `"Night"`

---

### 3.1 Create Worker (`POST`)
Creates a new worker/staff member.
- **Method**: `POST`
- **URL**: `http://localhost:4000/api/workers`
- **Body (`raw` -> `JSON`)**:
```json
{
  "name": "Rohan Verma",
  "email": "rohan.verma@fuelpoint.in",
  "phone": "+91 9111222333",
  "password": "password123",
  "shift": "Morning",
  "status": "active"
}
```
- **Expected Status**: `201 Created`
- *(Note the worker `id` returned, e.g., `WRK-01`, `WRK-12`, etc.)*

---

### 3.2 Get Workers List (`GET`)
Retrieves all workers with scan counts and volume metrics.
- **Method**: `GET`
- **URL**: `http://localhost:4000/api/workers`
- **Query Parameters (Optional)**:
  - `page`: `1`
  - `limit`: `10`
  - `shift`: `Morning`
  - `status`: `active`
- **Expected Status**: `200 OK`

---

### 3.3 Update Worker (`PUT`)
Updates an existing worker's details.
- **Method**: `PUT`
- **URL**: `http://localhost:4000/api/workers/<WORKER_ID>` *(e.g. `http://localhost:4000/api/workers/WRK-01` or ID from step 3.1)*
- **Body (`raw` -> `JSON`)**:
```json
{
  "name": "Rohan Verma",
  "email": "rohan.verma@fuelpoint.in",
  "phone": "+91 9111222333",
  "shift": "Evening",
  "status": "active"
}
```
- **Expected Status**: `200 OK`

---

### 3.4 Delete Worker (`DELETE`)
Deletes a worker by ID.
- **Method**: `DELETE`
- **URL**: `http://localhost:4000/api/workers/<WORKER_ID>`
- **Expected Status**: `200 OK`

---

## 4. Summary Table of All Endpoints

| Category | Action | Method | URL | Body Required? |
| :--- | :--- | :--- | :--- | :--- |
| **Groups** | Create | `POST` | `http://localhost:4000/api/groups` | Yes (JSON) |
| **Groups** | Get All | `GET` | `http://localhost:4000/api/groups` | No |
| **Groups** | Update | `PUT` | `http://localhost:4000/api/groups/:id` | Yes (JSON) |
| **Groups** | Delete | `DELETE` | `http://localhost:4000/api/groups/:id` | No |
| **Customers** | Create | `POST` | `http://localhost:4000/api/customers` | Yes (JSON) |
| **Customers** | Get All | `GET` | `http://localhost:4000/api/customers` | No |
| **Customers** | Update | `PUT` | `http://localhost:4000/api/customers/:id` | Yes (JSON) |
| **Customers** | Delete | `DELETE` | `http://localhost:4000/api/customers/:id` | No |
| **Workers** | Create | `POST` | `http://localhost:4000/api/workers` | Yes (JSON) |
| **Workers** | Get All | `GET` | `http://localhost:4000/api/workers` | No |
| **Workers** | Update | `PUT` | `http://localhost:4000/api/workers/:id` | Yes (JSON) |
| **Workers** | Delete | `DELETE` | `http://localhost:4000/api/workers/:id` | No |
