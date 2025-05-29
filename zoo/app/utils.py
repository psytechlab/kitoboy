import csv
from io import StringIO  
from .triton_api_client import TritonApiClient

def init_triton_connections(config: list[tuple[str, str, str]]):
    trtion_api_list = []
    for params in config:
        try:
            trtion_api_list.append(TritonApiClient(*params))
        except Exception as e:
            print(e)
    return trtion_api_list

def parse_csv(file_content) -> tuple[list[str], list[str]]:
    decoded_text = file_content.decode("utf-8")
    with StringIO(decoded_text) as f:
        filereader = csv.reader(f, delimiter=';')
        texts = []
        datetimes = []
        for i, r in enumerate(filereader):
            # header
            if i == 0:
                continue
            texts.append(r[1])
            datetimes.append(r[0])
    return datetimes, texts

def make_normalized_pred_obj(pred, color):
    return {"prediction": pred, "color" : color}

def normalize_predictions(predictions: list[list[str]], label_mapping: dict[str, str]):
    mapped_predictions = []
    for pred_line in predictions:
        pred_line = [label_mapping[x] for y in pred_line for x in y.split(";") if x in label_mapping]
        # we dont need "irrelevant" prediction if there exist any relevant one
        pred_line = [x for x in pred_line if x[0] != "нерелевантный"]
        if len(pred_line) == 0:
            pred_line = [label_mapping["нерелевантный"]]
        pred_line = [make_normalized_pred_obj(*x) for x in pred_line]
        mapped_predictions.append(pred_line)
    return mapped_predictions

