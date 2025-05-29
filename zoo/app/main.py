from fastapi import FastAPI, BackgroundTasks
import requests
from app.models import TextList, ServiceInput, TritonServerAddr

import yaml
from app.utils import init_triton_connections, normalize_predictions
from app.triton_api_client import TritonApiClient

from fastapi.middleware.cors import CORSMiddleware

import logging
import sys


stream_handler = logging.StreamHandler(sys.stdout)
logging.basicConfig(level=logging.INFO, handlers=[stream_handler], format="%(name)s %(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

def collect_predictions(input_texts: ServiceInput, label_mapping: dict[str, str], addr_to_send: str|None = None):
    texts = [f.text for f in input_texts.texts]
    ids = [f.text_id for f in input_texts.texts]
    preds = process_text(TextList(text_list=texts))
    normalized_preds = normalize_predictions(preds, label_mapping)
    output = {
        "texts": [{"id": str(idx), "predictions" :pred } for idx, pred in zip(ids, normalized_preds)]
    }
    if addr_to_send is not None:
        response = requests.post(addr_to_send, json=output)
        response.raise_for_status()

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('config/triton_services.yml', 'r') as file:
    app.state.triton_model_list = init_triton_connections(yaml.safe_load(file))

with open('config/mapping.yml', 'r') as file:
    app.state.label_mapping = yaml.safe_load(file)

with open('config/config.yml', 'r') as file:
    app.state.config = yaml.safe_load(file)

if len(app.state.triton_model_list) == 0:
    logger.warning("No Triton models are connected to the Zoo")

@app.get("/test_get", status_code=200)
def test_post():
    return {"messages": "test response"}

@app.post("/connect_server")
def connect_server(server: TritonServerAddr):
    if any(True for x in app.state.triton_model_list if x.model_name == server.model_name):
        return 400
    try:
        cl = TritonApiClient(server.ip_addr, server.port, server.model_name)
        logger.info(f"Connected the {server.model_name} model on {server.ip_addr}:{server.port}")
        app.state.triton_model_list.append(cl)
    except Exception as e:
        print(e)
        return 400
    return 200

@app.delete("/disconnect_server")
def disconnect_server(server: TritonServerAddr):
    if not any(True for x in app.state.triton_model_list if x.model_name == server.model_name):
        return 400
    for i, tr in enumerate(app.state.triton_model_list):
        if tr.model_name == server.model_name:
            tr.close_connection()
            app.state.triton_model_list.pop(i)
            logger.info(f"Disconnected the {tr.model_name} model on {tr.base}")
            return 200
        
@app.get("/show_services")
def show_services():
    output_data = []
    for tr in app.state.triton_model_list:
        output_data.append({"url": tr.base, "model_name": tr.model_name})
    return output_data

@app.put("/update_platform_endpoint")
def update_platform_endpoint(new_endpoint:str):
    if new_endpoint == "":
        new_endpoint = None
    app.state.config["endpoint_to_send_preds"] = new_endpoint
    logger.info(f"Platform endpoint updated on {new_endpoint}")
    return 200

@app.post("/predict_on_batch", status_code=202)
def create_upload_file(data: ServiceInput, background_tasks: BackgroundTasks):
    logger.debug(f"New batch of len={len(data.texts)} received")
    background_tasks.add_task(collect_predictions, data, app.state.label_mapping, app.state.config["endpoint_to_send_preds"])
    return {"status": "texts received"}

@app.post("/predict")
def process_text(texts: TextList):
    result = []
    for t in texts.text_list:
        preds = []
        for tr in app.state.triton_model_list:
            preds.extend(tr.make_prediction([t]))
        result.append(preds)
    return result
    
@app.post("/predict_on_text")
def process_text_list(texts: TextList):
    res = process_text(texts)
    mapped_predictions = []
    label_mapping = {x:y[0] for x,y in app.state.label_mapping.items()}
    for pred_line in res:
        pred_line = [label_mapping[x] for y in pred_line for x in y.split(";") if x in label_mapping]
        # we dont need "irrelevant" prediction if there exist any relevant one
        pred_line = [x for x in pred_line if x != "нерелевантный"]
        if len(pred_line) == 0:
            pred_line = [label_mapping["нерелевантный"]]
        mapped_predictions.append(pred_line)
    return mapped_predictions
