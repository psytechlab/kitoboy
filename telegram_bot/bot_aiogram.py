import asyncio
import logging
import aiohttp
import asyncpg
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from collections import defaultdict, deque
import time

class TelegramBot:
    def __init__(self, TOKEN, API_URL, DB_CONFIG, log_file='bot.log'):
        self.TOKEN = TOKEN
        self.API_URL = API_URL
        self.DB_CONFIG = DB_CONFIG
        logging.basicConfig(
            filename=log_file,
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s"
        )
        self.bot = Bot(token=self.TOKEN)
        self.dp = Dispatcher()
        self.dp.message.register(self.start, Command("start"))
        self.dp.message.register(self.process_message)
        self.dp.callback_query.register(self.feedback_callback)
        self.last_feedback_messages = dict()  # метка для отслеживания оценки модели
        self.user_requests = defaultdict(lambda: deque()) # количество запросов от пользователя
        self.rate_limit_count = 10         # максимально количество сообщений от пользователя
        self.rate_limit_seconds = 30    # лимит времени на количество запросов
    
    async def db_connect(self):
        return await asyncpg.connect(**self.DB_CONFIG)
    
    async def save_feedback(self, chat_id, message, model_response, feedback):
        conn = await self.db_connect()
        await conn.execute(
        """
        INSERT INTO model_evaluation (chat_id, message, model_response, feedback)
        VALUES ($1, $2, $3, $4);
        """,
        chat_id, message, model_response, feedback
        )
        await conn.close()

    async def start(self, message: types.Message):
        user_id = message.chat.id
        await message.answer("Привет! Введите текст для анализа")
    
    async def process_message(self, message: types.Message):
        user_id = message.chat.id
        text = message.text
        MAX_WORDS = 60
        # Проверка на лимит слов
        if text and len(text.split()) > MAX_WORDS:
            await message.answer(f"⚠️ Выражения для анализа должны содержать не более {MAX_WORDS} слов.")
            logging.info(f"Пользователь {user_id} отправил слишком длинное сообщение")
            return
        elif not text:
            await message.answer(f"Некорректное выражение. Попробуйте ещё раз")
            logging.info(f"Пользователь {user_id} отправил некорректное сообщение")
            return
        if self.check_limit(user_id):
            await message.answer("⏳ Слишком много запросо.")
            logging.info(f"Пользователь {user_id} отправил слишком много запросов")
            return      
        logging.info(f"Пользователь {user_id} отправил сообщение: {text}")
        await message.bot.send_chat_action(chat_id=message.chat.id, action="typing")

        last_msg = self.last_feedback_messages.get(user_id)

        if last_msg:
            try:
                await last_msg.edit_reply_markup(reply_markup=None)
            except Exception as e:
                logging.warning(f"Не удалось убрать старую клавиатуру: {e}")
            finally:
                self.last_feedback_messages[user_id] = None

        response_text = await self.query_model(text)
        if response_text:
            sent_message = await message.answer(response_text)
            await self.save_feedback(user_id, text, response_text, None)
            keyboard = InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="👍", callback_data=f"feedback:{sent_message.message_id}:true"),
                     InlineKeyboardButton(text="👎", callback_data=f"feedback:{sent_message.message_id}:false")]
                ]
            )
            feedback_prompt = await message.answer("Оцените ответ:", reply_markup=keyboard)
            #self.last_feedback_message = feedback_prompt
            self.last_feedback_messages[user_id] = feedback_prompt
        else:
            await message.answer("Произошла непредвиденная ошибка")
    
    async def feedback_callback(self, call: types.CallbackQuery):
        user_id = call.message.chat.id
        _, message_id, feedback_value = call.data.split(":")
        feedback_value = feedback_value == "true"
        conn = await self.db_connect()
        await conn.execute(
            """
            UPDATE model_evaluation
            SET feedback = $1
            WHERE id = (
                SELECT id FROM model_evaluation
                WHERE chat_id = $2 AND feedback IS NULL
                ORDER BY id DESC
                LIMIT 1
            );
            """,
            feedback_value, user_id
        )
        await conn.close()
        #await call.answer("Спасибо за вашу оценку!")
        await call.message.answer("Спасибо за вашу оценку!\nОтправляйте выражения ещё")
        await call.message.edit_reply_markup(reply_markup=None)
    
    async def query_model(self, text):
        payload = {"text_list": [text]}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.API_URL, json=payload, headers={"Content-Type": "application/json"}) as response:
                    response.raise_for_status()
                    result = await response.json()
                    #return result[0][0]
                    if result and result[0]:
                        return ", ".join(str(item) for item in set(result[0]))
                    else:
                        logging.error(f"Ошибка запроса: {e}")
                        return None
        except Exception as e:
            logging.error(f"Ошибка запроса: {e}")
            return None

    def check_limit(self, user_id):
        now = time.time()
        queue = self.user_requests[user_id]

        # Удаляем старые записи
        while queue and now - queue[0] > self.rate_limit_seconds:
            queue.popleft()

        if len(queue) >= self.rate_limit_count:
            return True
        else:
            queue.append(now)
            return False

    async def run(self):
        logging.info("Запуск бота")
        await self.dp.start_polling(self.bot)

if __name__ == "__main__":
    TOKEN = ""
    API_URL = "http://127.0.0.1:8888/predict_on_text"
    DB_CONFIG = {
        "database": "kitoboy_db",         # Имя базы данных
        "user": "kitoboy_user",         # Имя пользователя
        "password": "mysecretpassword",   # Пароль
        "host": "127.0.0.1",           # Адрес сервера
        "port": "8080"            # Порт PostgreSQL
        }
    bot = TelegramBot(TOKEN, API_URL, DB_CONFIG)
    asyncio.run(bot.run())
