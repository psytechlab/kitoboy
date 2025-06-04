"""The main file of FastAPI app"""
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
logging.basicConfig(
    level=logging.INFO,
    handlers=[stream_handler],
    format="%(name)s %(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)


def collect_predictions(
    input_texts: ServiceInput,
    label_mapping: dict[str, tuple[str, str]],
    irrelevant_class_name: str,
    separator: str,
    url_to_send: str | None = None,
):
    """Collect predictions from model servies and send them to the platform BD.

    This is a background task executed by "/predict_on_batch".

    Args:
        input_texts (ServiceInput): The text to be predicted.
        label_mapping (dict[str, tuple[str, str]]): The mapping of class names where key is a class name
        and value is a tuple of class name and color code, both str.
        separator (str): A multilabel class separator.
        irrelevant_class_name (str): A name for irrelevant class.
        url_to_send (str | None, optional): The endpoint url to send to. Defaults to None.
    """
    texts = [f.text for f in input_texts.texts]
    ids = [f.text_id for f in input_texts.texts]
    preds = process_text(TextList(text_list=texts))
    normalized_preds = normalize_predictions(preds, label_mapping, separator, irrelevant_class_name)
    output = {
        "texts": [
            {"id": str(idx), "predictions": pred}
            for idx, pred in zip(ids, normalized_preds)
        ]
    }
    logger.info(
            output
        )
    if url_to_send is not None:
        response = requests.post(url_to_send, json=output)
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

with open("config/triton_services.yml", "r") as file:
    app.state.triton_model_list = init_triton_connections(yaml.safe_load(file))

with open("config/mapping.yml", "r") as file:
    app.state.label_mapping = yaml.safe_load(file)

with open("config/config.yml", "r") as file:
    app.state.config = yaml.safe_load(file)

IRRELEVANT_CLASS_NAME = app.state.config["irrelevant_class_name"]

if IRRELEVANT_CLASS_NAME not in app.state.label_mapping:
    raise ValueError(f"The irrelevant class name '{IRRELEVANT_CLASS_NAME}' is not in label mapping")

if len(app.state.triton_model_list) == 0:
    logger.warning("No Triton models are connected to the Zoo")

@app.post("/connect_server")
def connect_server(server: TritonServerAddr) -> int:
    """Perform a conntection to the Triton model services.

    Args:
        server (TritonServerAddr): The address of the service.

    Returns:
        int: Status code. 200 if success, 400 otherwise.
    """
    if any(
        True for x in app.state.triton_model_list if x.model_name == server.model_name
    ):
        return 400
    try:
        cl = TritonApiClient(server.url, server.port, server.model_name)
        logger.info(
            f"Connected the {server.model_name} model on {server.url}:{server.port}"
        )
        app.state.triton_model_list.append(cl)
    except Exception as e:
        print(e)
        return 400
    return 200


@app.delete("/disconnect_server")
def disconnect_server(model_name: str) -> int:
    """Disconnect the Triton model service from the Zoo.

    Args:
        model_name (str): Name of the registered model in Zoo.

    Returns:
        int: Status code. 200 if success, 400 otherwise.
    """
    if not any(
        True for x in app.state.triton_model_list if x.model_name == model_name
    ):
        return 400
    for i, tr in enumerate(app.state.triton_model_list):
        if tr.model_name == model_name:
            tr.close_connection()
            app.state.triton_model_list.pop(i)
            logger.info(f"Disconnected the {tr.model_name} model on {tr.base}")
            return 200


@app.get("/show_services")
def show_services() -> list[dict[str, str]]:
    """Show the connected model services to the Zoo.

    Returns:
        list[dict[str,srr]]: The list of objects with model names and
        corresponding url.
    """
    output_data = []
    for tr in app.state.triton_model_list:
        output_data.append({"url": tr.base, "model_name": tr.model_name})
    return output_data


@app.put("/update_platform_endpoint")
def update_platform_endpoint(new_endpoint: str) -> int:
    """Update the platform endpoint where the prediction results should be send.

    It's intended to be an endpoint that takes predictions and store then
    into a platform BD.

    Args:
        new_endpoint (str): The url of a new endpoint.

    Returns:
        int: Status code, 200 if success.
    """
    if new_endpoint == "":
        new_endpoint = None
    app.state.config["endpoint_to_send_preds"] = new_endpoint
    logger.info(f"Platform endpoint updated on {new_endpoint}")
    return 200


@app.post("/predict_on_batch", status_code=202)
def predict_on_batch(data: ServiceInput, background_tasks: BackgroundTasks) -> dict[str, str]:
    """Takes texts to be predicted and create a background task.

    The background task is for for prediction collection and sending the result to the platform.

    Args:
        data (ServiceInput): Data from the platform to be predicted.
        background_tasks (BackgroundTasks): The dependency of background task.

    Returns:
        dict[str, str]: The object with accept message.
    """
    logger.debug(f"New batch of len={len(data.texts)} received")
    background_tasks.add_task(
        collect_predictions,
        data,
        app.state.label_mapping,
        IRRELEVANT_CLASS_NAME,
        app.state.config["separator"],
        app.state.config["endpoint_to_send_preds"],
    )
    return {"status": "texts received"}


@app.post("/predict")
def process_text(texts: TextList) -> list[list[str]]:
    """Collect predictions for the text list.

    This is a simple function that doesn't perform any postprocessing.
    Only collect the predictions from the registered Triton services.

    Args:
        texts (TextList): The list of texts to be predicted.

    Returns:
        list[list[str]]: The predicted classes.
    """
    result = []
    for t in texts.text_list:
        preds = []
        for tr in app.state.triton_model_list:
            preds.extend(tr.make_prediction([t]))
        result.append(preds)
    return result


@app.post("/predict_on_text")
def process_text_list(texts: TextList):
    """Collect predictions and format them by class mapping.

    This is a modification of the `predict` method that performs
    a post-processing that includes mapping of class names and
    normalizing lists of predictions.

    Args:
        texts (TextList): The list of texts to be predicted.

    Returns:
        list[list[str]]: The predicted classes.
    """
    res = process_text(texts)
    mapped_predictions = []
    label_mapping = {x: y[0] for x, y in app.state.label_mapping.items()}
    for pred_line in res:
        pred_line = [
            label_mapping[x]
            for y in pred_line
            for x in y.split(";")
            if x in label_mapping
        ]
        # we dont need "irrelevant" prediction if there exist any relevant one
        pred_line = [x for x in pred_line if x != IRRELEVANT_CLASS_NAME]
        if len(pred_line) == 0:
            pred_line = [label_mapping[IRRELEVANT_CLASS_NAME]]
        mapped_predictions.append(pred_line)
    return mapped_predictions
