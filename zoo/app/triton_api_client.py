import requests

class TritonApiClient:
    """Simple Api client for Triton inference server
    
    The server does two things:
        1. Allow to check whether the model is ready to be inferenced.
        2. Send the texts to make a prediction
    """
    def __init__(self, base: str, port:int, model_name: str):
        self.base = f"{base}:{port}/v2"
        self.model_name = model_name
        self.sess = requests.Session()
        self.sess.keep_alive = True
        res = self.sess.get(self.base)
        if res.status_code != 200:
            res.raise_for_status()
        print(f"Connection establisshed to the Triton model {model_name}")
        model_config = self.sess.get(f"{self.base}/models/{model_name}/config").json()
        self.max_batch_size = model_config["max_batch_size"]
        
    def is_ready(self) -> bool:
        response = self.sess.get(f"{self.base}/health/ready")
        if response.status_code == 200:
            return True
        else:
            return False
        
    def _make_object(self, text_list: list[str]) -> dict:
        return  {
            "inputs":
            [
                {"name":"text_input",
                 "shape":[len(text_list), 1],
                 "datatype":"BYTES",
                 "data": text_list
                }
            ]
        }

    def make_prediction_on_batch(self, batch: list[str]) -> list:
        response = self.sess.post(f"{self.base}/models/{self.model_name}/infer", json=self._make_object(batch))
        if response.status_code == 200:
            preds = response.json()["outputs"][0]["data"]
            return preds
        else:
            response.raise_for_status()

    def make_prediction(self, texts: list[str]):
        all_preds = []
        for i in range(0, len(texts), self.max_batch_size):
            all_preds.extend(self.make_prediction_on_batch(texts[i:i+self.max_batch_size]))
        return all_preds

            
    def close_connection(self):
        self.sess.close()
        self.sess = None