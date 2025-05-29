export const customCorsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(' ');

        if (!origin || allowedOrigins?.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Request from unauthorized origin'));
        }
    },
};
