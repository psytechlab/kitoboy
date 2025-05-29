# kitoboy-zoo

Модуль выполняет роль концентратора для тритон-сервисов и позволяет пользователям получать предсказания для текстов от этих сервисов.

# Запуск

1. Необходимо собрать докер-образ командой
```
$ docker build -t kitoboy-zoo:latest .
```

2. Скопировать конфигурационные файлы в подходящую папку.
```
$ mkdir -p /etc/kitoboy-zoo
$ cp ~/config/*  /etc/kitoboy-zoo
```
3. Отредактировать конфигурационные файлы.
4. Запустить докер-контейнер команадой
```
$ docker container run -p8000:8000 -v /etc/kitoboy-zoo:/configs kitoboy-zoo:latest
```

# Пример запроса

```
$ curl -X POST http://localhost:8000/predict_on_batch -H "Content-Type: application/json" -d '{"texts":[{"text_id": 1, "text": "text1"}, {"text_id": 2, "text":"text2"}, {"text_id": 3, "text":"text3"}]}'
$ curl -X GET http://localhost:8000/test_get -H "Content-Type: application/json"
```
