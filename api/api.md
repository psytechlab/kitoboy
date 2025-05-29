# API


## get `/search-person?searchString={searchString}`
### Request:
```
searchString: String
```
### Response:
```
{
    persons: [
        id: String,
        surname: String,
        name: String,
        secondName?: String,
        age?: String;
        address?: String;
        phone?: String;
        organization?: String;
        description?: String;
        statusId?: String;
    ],
}
```


## post `/create-avatar`
### Request-Headers:
```
{
    "Content-Type": "multipart/form-data",
}
```
### Request:
```
{
    // CSV-файл
    // Первая колонка - дата и время с тайм-зоной ("2025-04-10T12:38:22.922Z")
    // Вторая колонка - текст
    // Названия колонок отсутствуют, данные парсятся, начиная с первой строки
    file: File, 
    
    username: String,
    url: String,
    
    // В случае, если добавляем аватар для уже существующего в системе пользователя:
    personId: String,
    
    // В случае, если создаем нового пользователя:
    surname: String;
    name: String;
    secondName?: String;
    age?: String;
    address?: String;
    phone?: String;
    organization?: String;
    description?: String;
}
```
### Response:
```
{
    id: String,
}
```


## get `/get-avatar/?{id}`
### Request:
```
id: String // Avatar ID
```
### Response:
```
{
    id: String,
    userName: String,
    url: String,
    person: {
        id: String;
        surname: String;
        name: String;
        secondName?: String;
        age?: String;
    };
    status: {
        id: String;
        name: String;
        color: String;
    };
    posts: [
        {
            id: String;
            text: String;
            postedAt: String;
            attributes?: [
                {
                    id: String;
                    name: String;
                    color: String;
                }
            ];
        },
    ];
}
```


## post `/get-avatars`
### Request:
```
{
    page?: Number,
    size?: Number,
}
```
### Response:
```
{
    avatars: [
        {
            id: String,
            userName: String,
            url: String,
            person: {
                id: String;
                surname: String;
                name: String;
                secondName?: String;
                age?: String;
            };
            status: {
                id: String;
                name: String;
                color: String;
            };
            posts: [
                {
                    id: String;
                    text: String;
                    postedAt: String;
                    attributes?: [
                        {
                            id: String;
                            name: String;
                            color: String;
                        }
                    ];
                },
            ];
        },
    ],
}
```


## get `/get-person-with-avatars/:personId`
### Request:
```
personId: String // Person ID
```
### Response:
```
{
    id: String;
    surname: String;
    name: String;
    secondName?: String;
    age?: String;
    address?: String;
    phone?: String;
    organization?: String;
    description?: String;
    status: {
        id: String;
        name: String;
        color: String;
    },
    avatars: [
        {
            id: String,
            userName: String,
            url: String,
            status: {
                id: String;
                name: String;
                color: String;
            };
            posts: [
                {
                    id: String;
                    text: String;
                    postedAt: String;
                    attributes?: [
                        {
                            id: String;
                            name: String;
                            color: String;
                        },
                    ];
                },
            ];
        },
    ],
}
```

## post `/update-person/:personId`
### Request:
```
personId: String
```
### Body:
```
{
    surname?: String;
    name?: String;
    secondName?: String;
    age?: String;
    address?: String;
    phone?: String;
    organization?: String;
    description?: String;
}
```
### Response:
```
{
    id: String,
    surname: String,
    name: String,
    secondName?: String,
    age?: String;
    address?: String;
    phone?: String;
    organization?: String;
    description?: String;
}
```


## get `/get-attributes`
### Request:
```
-
```
### Response:
```
{
    attributes: [
        id: String,
        name: String,
        color: String,
    ],
}
```


## get `/get-statuses`
### Request:
```
-
```
### Response:
```
{
    statuses: [
        id: String,
        name: String,
        color: String,
    ],
}
```


## post `/add-posts-attributes`
### Body:
```
{
    texts: [
        {
            id: String,
            predictions: [
                {
                    prediction: String;
                    color: String;
                },
                ...
            ],
        },
        ...
    ],
}
```
### Response:
```
{
    posts: [
        id: String;
        text: String;
        postedAt: String;
        avatarId: String;
        attributes: [
            {
                id: String;
                name: String;
                color: String;
            },
        ],
    ],
}
```


## post `/add-post-attribute:postId`
### Body:
```
{
    attributeId: String
}
```
### Response:
```
{}
```


## post `/remove-post-attribute:postId`
### Body:
```
{
    attributeId: String
}
```
### Response:
```
{}
```


## post `/login`
### Body:
```
{
    username: String;
    password: String;
}
```
### Response:
```
{
    message: String;
    token: String;
}
```


## post `/update-avatar-status/:avatarId`
### Request:
```
avatarId: String
```
### Body:
```
{
    statusId: String;
}
```
### Response:
```
{
    id: String,
    userName: String,
    url: String,
    person: {
        id: String;
        surname: String;
        name: String;
        secondName?: String;
        age?: String;
    };
    status: {
        id: String;
        name: String;
        color: String;
    };
    posts: [
        {
            id: String;
            text: String;
            postedAt: String;
            attributes?: [
                {
                    id: String;
                    name: String;
                    color: String;
                }
            ];
        },
    ];
}
```


## post `/update-person-status/:personId`
### Request:
```
personId: String
```
### Body:
```
{
    statusId: String;
}
```
### Response:
```
{
    id: String,
    surname: String,
    name: String,
    secondName?: String,
    age?: String;
    address?: String;
    phone?: String;
    organization?: String;
    description?: String;
}
```
