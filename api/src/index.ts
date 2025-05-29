import express, {Express, Router} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import {initDatabase} from './db';
import {
    addPostAttributeHandler,
    addPostsAttributesHandler,
    createAvatarHandler,
    getAttributesHandler,
    getAvatarHandler,
    getAvatarsHandler,
    getPersonWithAvatarsHandler,
    getStatusesHandler,
    loginHandler,
    notFoundHandler,
    registerHandler,
    removePostAttributeHandler,
    searchPersonHandler,
    updateAvatarStatusHandler,
    updatePersonHandler,
    updatePersonStatusHandler,
} from './handlers';
import {authenticateToken, customCorsOptions} from './middleware';

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 3052;
const router = Router();

const upload = multer({dest: 'uploads/'});

app.use(cors(customCorsOptions));
app.use(express.json());
app.use(upload.single('file'));

// Routes
app.use('/', router);

app.post('/login', loginHandler);

app.post('/register', registerHandler);

app.post('/add-posts-attributes', addPostsAttributesHandler);

app.use(authenticateToken);

app.post('/add-attribute/:postId', addPostAttributeHandler);

app.post('/create-avatar', createAvatarHandler);

app.get('/get-attributes', getAttributesHandler);

app.get('/get-avatar/:avatarId', getAvatarHandler);

app.post('/get-avatars', getAvatarsHandler);

app.get('/get-person-with-avatars/:personId', getPersonWithAvatarsHandler);

app.get('/get-statuses', getStatusesHandler);

app.post('/remove-attribute/:postId', removePostAttributeHandler);

app.get('/search-person', searchPersonHandler);

app.post('/update-avatar-status/:avatarId', updateAvatarStatusHandler);

app.post('/update-person/:personId', updatePersonHandler);

app.post('/update-person-status/:personId', updatePersonStatusHandler);

app.get('/*splat', notFoundHandler);

// Ждем создания БД
setTimeout(async () => {
    await initDatabase();
}, 10000);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
