export type PredictOnBatchBody = {
    texts: {text_id: string; text: string}[];
};

export async function predictOnBatch(body: PredictOnBatchBody) {
    return await fetch('http://zoo:8000/predict_on_batch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    });
}
