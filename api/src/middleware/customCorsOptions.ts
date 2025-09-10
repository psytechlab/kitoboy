export const customCorsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(' ');
        const appHostname = process.env.APP_HOST;

        if (
            !origin ||
            allowedOrigins?.indexOf(origin) !== -1 ||
            (appHostname && `http://${appHostname}:5173` === origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error('Request from unauthorized origin'));
        }
    },
};
