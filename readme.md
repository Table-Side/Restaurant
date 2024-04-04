# Tableside: Restaurant

The microservice responsible for restaurant details.

## API Routes

### GET `/restaurants/all`: Get all restaurants

- Authentication?: No

#### Request Body

None

#### Response Body
```json
{
    "data": [
        {
            // todo
        }
    ]
}
```

### GET `/restaurants/mine`: Get all restaurants belonging to user

- Authentication?: Yes
  - Role: `restaurant`

#### Request Body

None

#### Response Body
```json
{
    "data": [
        {
            // todo
        }
    ]
}
```

### POST `/restaurants/create`: Create a restaurant

- Authentication?: Yes
  - Role: Any

#### Request Body
```json
{
    "name": "Wates House",
    "description": "Wates House student bar and restaurant offers a great menu, a coffee and milkshake counter and a full bar with a fabulous range of cocktails including a great non-alcoholic selection, draught beer, cider and a range of bottled beers.",
    "numberOfTables": 50
}
```

#### Response Body
```json
{
    "data": [
        {
            // todo
        }
    ]
}
```

### GET `/restaurants/:restaurantId/details`: Get details of a specific restaurant

- Authentication? No

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`

#### Request Body

None

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### PUT `/restaurants/:restaurantId/update`: Update a specific restaurant

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`

#### Request Body
```json
{
    "name": "Wates House",
    "description": "The coolest bar on campus",
    "numberOfTables": 65
}
```

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### GET `/restaurants/:restaurantId/menu`: Get all menus for restaurant

- Authentication?: No

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`

#### Request Body

None

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### POST `/restaurants/:restaurantId/menu/new`: Create a new menu for a restaurant

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`

#### Request Body
```json
{
    "name": "Lunch",
    "validFrom": "12:00:00",
    "validUntil": "21:00:00"
}
```

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### PUT `/restaurants/:restaurantId/menu/:menuId/update`: Update a menu for a restaurant

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`
- menuId: The ID of the menu. `String (UUID)`

#### Request Body
```json
{
    "name": "Lunch",
    "validFrom": "12:00:00",
    "validUntil": "21:00:00"
}
```

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### GET `/restaurants/:restaurantId/menu/:menuId/details`: Get a specific menu for a restaurant

- Authentication?: No

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`
- menuId: The ID of the menu. `String (UUID)`

#### Request Body

None

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### POST `/restaurants/:restaurantId/menu/:menuId/add`: Add an item to a menu

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`
- menuId: The ID of the menu. `String (UUID)`

#### Request Body
```json
{
    "displayName": "Cheesy Chips",
    "shortName": "C Chips",
    "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
    "price": 5.29
}
```

#### Response Body
```json
{
    "data": [
        ...,
        {
            // todo
        },
        ...
    ]
}
```

### PUT `/restaurants/:restaurantId/menu/:menuId/:itemId/update`: Update an item on the menu

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`
- menuId: The ID of the menu. `String (UUID)`
- itemId: The ID of the item. `String (UUID)`

#### Request Body
```json
{
    "displayName": "Cheesy Chips",
    "shortName": "C Chips",
    "description": "A plate of chips, loaded with a mix of mozzarella, cheddar and cheese sauce.",
    "price": 5.99
}
```

#### Response Body
```json
{
    "data": [
        ...,
        {
            // todo
        },
        ...
    ]
}
```

### PUT `/restaurants/:restaurantId/menu/:menuId/:itemId/update/availability/:availabilityState`: Update whether an item is available for ordering

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`
- menuId: The ID of the menu. `String (UUID)`
- itemId: The ID of the item. `String (UUID)`
- availabilityState: The new availability state of the menu item. `Boolean (true/false)`

#### Request Body

None

#### Response Body
```json
{
    "data": {
        // todo
    }
}
```

### DELETE `/:restaurantId/menu/:menuId/:itemId/remove`: Remove an item from a menu

- Authentication?: Yes
  - Role: `restaurant`

#### Params
- restaurantId: The ID of the restaurant. `String (UUID)`
- menuId: The ID of the menu. `String (UUID)`
- itemId: The ID of the item. `String (UUID)`

#### Request Body

None

#### Response Body

None
