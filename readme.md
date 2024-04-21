# Tableside: Restaurant

The microservice responsible for restaurant details.

## Types

- **`Boolean`**: `true` or `false`
- **`String`**: standard UTF-8 string
- **`DateTime`**: ISO-8601 formatted date string.
- **`Decimal`**: a decimal number - sent down as a string for interoperability, but can be specified as a number or a string

## Models

### Restaurant

- `id` (**`String`**): UUID of the Restaurant. (Used to refer to the Restaurant in URLs, etc.,)
- `createdAt` (**`DateTime`**): Date and time of when the Restaurant was created.
- `updatedAt` (**`DateTime`**): Date and tiem of when the Restaurant was last updated.

- `name` (**`String`**): human-readable name of the Restaurant (e.g., _"MacAdoo's"_), set by its owner.
- `description` (**`String`**): human-readable description of the Restaurant, set by its owner.

- (Optional) `menus` (**`Array`**): an array of [**Menu**](#menu)s that belong to the Restaurant. (Only included in responses that include the Restaurant's menus - e.g., when getting a specific Restaurant.)

### Menu

- `id` (**`String`**): UUID of the Menu. (Used to refer to the Menu in URLs, etc.,)
- `createdAt` (**`DateTime`**): Date and time of when the Menu was created.
- `updatedAt` (**`DateTime`**): Date and tiem of when the Menu was last updated.

- `name` (**`String`**): human-readable name of the Menu (e.g., _"Lunch"_), set by its owner.

- `restaurantId` (**`String`**): UUID of the [**Restaurant**](#restaurant) that the Menu belongs to.

- (Optional) `items` (**`Array`**): an array of [**Item**](#item)s that belong to the Menu. (Only included in responses that include the Menu's items - e.g., when getting a specific Menu.)

### Item

- `id` (**`String`**): UUID of the Item. (Used to refer to the Item in URLs, etc.,)
- `createdAt` (**`DateTime`**): Date and time of when the Item was created.
- `updatedAt` (**`DateTime`**): Date and tiem of when the Item was last updated.

- `displayName` (**`String`**): human-readable full name of the Item (e.g., _"Chargrilled Shrimp and Cheese Grits"_), set by its owner.
- `shortName` (**`String`**): human-readable short name of the Item (e.g., _"Shrimp and Grits"_), set by its owner.
- `description` (**`String`**): human-readable description of the Item (e.g., _"The most delicious thing you will ever eat!"_), set by its owner.
- `price` (**`Decimal`**): the decimal price of the Item (e.g., `6.99`).
- `isAvailable` (**`Boolean`**): whether the Item is currently in stock.

- `menuId` (**`String`**): UUID of the [**Menu**](#menu) that the Menu belongs to.

## API Routes

### Restaurants

Manage an entire [**Restaurant**](#restaurant).

- **GET** `/`: Get all restaurants

    - **Example Response** (200: OK):

    ```json
    {
        "data": [
            {
                "id": "87609a67-fd64-49a1-ac15-7408a39b9739",
                "createdAt": "2024-04-21T02:22:08.960Z",
                "updatedAt": "2024-04-21T02:23:41.551Z",
                "name": "Wates House",
                "description": "Wates House student bar and restaurant offers a great menu, a coffee and milkshake counter and a full bar with a fabulous range of cocktails including a great non-alcoholic selection, draught beer, cider and a range of bottled beers."
            }
        ]
    }
    ```

- **GET** `/restaurants/:id`: Get a specific restaurant by its ID

    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "87609a67-fd64-49a1-ac15-7408a39b9739",
            "createdAt": "2024-04-21T02:22:08.960Z",
            "updatedAt": "2024-04-21T02:23:41.551Z",
            "name": "Wates House",
            "description": "Wates House student bar and restaurant offers a great menu, a coffee and milkshake counter and a full bar with a fabulous range of cocktails including a great non-alcoholic selection, draught beer, cider and a range of bottled beers.",
            "menus": []
        }
    }
    ```

- **PUT** `/restaurants`: Create a new restaurant

    - **Requires**:
        - authentication
        - `restaurant` role

    - **Example Request Body**:
    ```json
    {
        "name": "New Restaurant",
        "description": "This is a new restaurant."
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "87609a67-fd64-49a1-ac15-7408a39b9739",
            "createdAt": "2024-04-21T02:22:08.960Z",
            "updatedAt": "2024-04-21T02:23:41.551Z",
            "name": "New Restaurant",
            "description": "This is a new restaurant."
        }
    }
    ```

- **PATCH** `/restaurants/:id`: Update a specific restaurant by its ID

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Request Body**:
    ```json
    {
        "name": "Updated Restaurant",
        "description": "This is an updated restaurant."
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "87609a67-fd64-49a1-ac15-7408a39b9739",
            "createdAt": "2024-04-21T02:22:08.960Z",
            "updatedAt": "2024-04-21T02:23:41.551Z",
            "name": "Updated Restaurant",
            "description": "This is an updated restaurant."
        }
    }
    ```

- **DELETE** `/restaurants/:id`: Delete a specific restaurant by its ID

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Response** (204: No Content)

### Menus

Manage [**Menu**](#menu)s for a [**Restaurant**](#restaurant).

- **GET** `/restaurants/:id/menus`: Get all menus for a specific restaurant by its ID

    - **Example Response** (200: OK):
    ```json
    {
        "data": [
            {
                "id": "bb3ba3d2-b9eb-4ebe-a2d2-c1c3b5a4f5f1",
                "createdAt": "2024-04-21T02:37:37.006Z",
                "updatedAt": "2024-04-21T02:59:49.854Z",
                "name": "Lunch Menu",
                "restaurantId": "87609a67-fd64-49a1-ac15-7408a39b9739"
            },
            {
                "id": "8d40c69a-4e8e-4d29-bf8b-f62a72760781",
                "createdAt": "2024-04-21T02:37:37.006Z",
                "updatedAt": "2024-04-21T02:59:49.854Z",
                "name": "Dinner Menu",
                "restaurantId": "87609a67-fd64-49a1-ac15-7408a39b9739"
            }
        ]
    }
    ```

- **GET** `/restaurants/:id/menus/:menuId`: Get a specific restaurant menu by its ID (plus its items)

    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "3f5945d7-cda8-441a-b143-d275c1e2a6df",
            "createdAt": "2024-04-21T02:37:37.006Z",
            "updatedAt": "2024-04-21T02:59:49.854Z",
            "name": "Specials",
            "restaurantId": "87609a67-fd64-49a1-ac15-7408a39b9739",
            "items": [
                {
                    "id": "d1eb3a7c-8ec5-4f04-b6a0-275e37691305",
                    "createdAt": "2024-04-21T02:43:28.552Z",
                    "updatedAt": "2024-04-21T02:54:58.604Z",
                    "displayName": "Cheesy Chips",
                    "shortName": "Chips",
                    "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
                    "price": "6.99",
                    "isAvailable": true,
                    "menuId": "3f5945d7-cda8-441a-b143-d275c1e2a6df"
                }
            ]
        }
    }
    ```

- **PUT** `/restaurants/:id/menus`: Create a restaurant menu

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Request Body**
    ```json
    {
        "name": "Breakfast"
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "b61d2bdc-cfd1-4d93-92d3-406c5439491d",
            "createdAt": "2024-04-21T03:31:45.093Z",
            "updatedAt": "2024-04-21T03:31:45.093Z",
            "name": "Breakfast",
            "restaurantId": "87609a67-fd64-49a1-ac15-7408a39b9739"
        }
    }
    ```

- **PATCH** `/restaurants/:id/menus/:menuId`: Update a restaurant menu by its ID

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Request Body**
    ```json
    {
        "name": "Special Breakfast"
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "b61d2bdc-cfd1-4d93-92d3-406c5439491d",
            "createdAt": "2024-04-21T03:31:45.093Z",
            "updatedAt": "2024-04-21T03:33:24.771Z",
            "name": "Special Breakfast",
            "restaurantId": "87609a67-fd64-49a1-ac15-7408a39b9739"
        }
    }
    ```

- **DELETE** `/restaurants/:id/menus/:menuId`: Delete a specific menu by its ID for a specific restaurant by its ID

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Response** (204: No Content)

### Items

Manage [**Item**](#item)s for a [**Menu**](#menu).

- **GET** `/restaurants/:id/menus/:menuId/items`: Get all items for a specific menu by its ID

    - **Example Response** (200: OK):
    ```json
    {
        "data": [
            {
                "id": "d1eb3a7c-8ec5-4f04-b6a0-275e37691305",
                "createdAt": "2024-04-21T02:43:28.552Z",
                "updatedAt": "2024-04-21T03:45:41.498Z",
                "displayName": "Cheesy Chips",
                "shortName": "Chips",
                "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
                "price": "9.91",
                "isAvailable": true,
                "menuId": "3f5945d7-cda8-441a-b143-d275c1e2a6df"
            }
        ]
    }
    ```

- **PUT** `/restaurants/:id/menus/:menuId/items`: Add a new item to a specific menu by its ID

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Request Body**
    ```json
    {
        "displayName": "French Toast",
        "shortName": "French Toast",
        "description": "Toast... but French.",
        "price": 8.29
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "3f5945d7-cda8-441a-b143-d275c1e2a6df",
            "createdAt": "2024-04-21T02:37:37.006Z",
            "updatedAt": "2024-04-21T02:59:49.854Z",
            "name": "Specials",
            "restaurantId": "87609a67-fd64-49a1-ac15-7408a39b9739",
            "items": [
                {
                    "id": "d1eb3a7c-8ec5-4f04-b6a0-275e37691305",
                    "createdAt": "2024-04-21T02:43:28.552Z",
                    "updatedAt": "2024-04-21T03:45:41.498Z",
                    "displayName": "Cheesy Chips",
                    "shortName": "Chips",
                    "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
                    "price": "9.91",
                    "isAvailable": true,
                    "menuId": "3f5945d7-cda8-441a-b143-d275c1e2a6df"
                },
                {
                    "id": "e9769b53-7e86-40dc-9fff-f535868630bb",
                    "createdAt": "2024-04-21T03:47:11.477Z",
                    "updatedAt": "2024-04-21T03:47:11.477Z",
                    "displayName": "French Toast",
                    "shortName": "French Toast",
                    "description": "Toast... but French.",
                    "price": "8.29",
                    "isAvailable": true,
                    "menuId": "3f5945d7-cda8-441a-b143-d275c1e2a6df"
                }
            ]
        }
    }
    ```

- **PATCH** `/restaurants/:id/menus/:menuId/items/:itemId`: Update an item by its ID for a specific menu

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Request Body**
    ```json
    {
        "name": "Cheesy Chips Deluxe",
        "price": 9.99
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "d1eb3a7c-8ec5-4f04-b6a0-275e37691305",
            "createdAt": "2024-04-21T02:43:28.552Z",
            "updatedAt": "2024-04-21T03:41:46.918Z",
            "displayName": "Cheesy Chips Deluxe",
            "shortName": "Chips",
            "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
            "price": "9.99",
            "isAvailable": false,
            "menuId": "3f5945d7-cda8-441a-b143-d275c1e2a6df"
        }
    }
    ```

- **PATCH** `/restaurants/:id/menus/:menuId/items/:itemId/availability`: Update an item's availability by its ID for a specific menu

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Request Body**
    ```json
    {
        "isAvailable": false
    }
    ```
    - **Example Response** (200: OK):
    ```json
    {
        "data": {
            "id": "d1eb3a7c-8ec5-4f04-b6a0-275e37691305",
            "createdAt": "2024-04-21T02:43:28.552Z",
            "updatedAt": "2024-04-21T03:41:46.918Z",
            "displayName": "Cheesy Chips",
            "shortName": "Chips",
            "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
            "price": "6.99",
            "isAvailable": false,
            "menuId": "3f5945d7-cda8-441a-b143-d275c1e2a6df"
        }
    }
    ```

- **DELETE** `/restaurants/:id/menus/:menuId/items/:itemId`: Delete a specific item by its ID for a specific menu by its ID

    - **Requires**:
        - authentication
        - `restaurant` role
        - ownership of the specified restaurant

    - **Example Response** (204: No Content)
