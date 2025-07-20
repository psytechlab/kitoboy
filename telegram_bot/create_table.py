import psycopg2

DB_CONFIG = {
    "dbname": "kitiboy_db",         # Имя базы данных
    "user": "kitoboy_user",         # Имя пользователя
    "password": "",   # Пароль
    "host": "127.0.0.1",           # Адрес сервера
    "port": "5432"            # Порт PostgreSQL
}

def db_connect():
    """Создаёт подключение к БД."""
    return psycopg2.connect(**DB_CONFIG)

conn = db_connect()
print("Успешное подключение к БД")
conn.close()

def create_table():
    """Создаёт таблицу, если её нет."""
    conn = db_connect()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS model_evaluation (
            id SERIAL PRIMARY KEY,
            chat_id BIGINT,          -- ID пользователя Telegram
            message TEXT,            -- Входящее сообщение
            model_response TEXT,     -- Ответ модели
            feedback BOOLEAN         -- Оценка (True = правильно, False = неправильно)
        );
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("Таблица model_evaluation проверена/создана")

create_table()
