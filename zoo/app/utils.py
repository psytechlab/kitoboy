from app.triton_api_client import TritonApiClient


def init_triton_connections(
    config: list[tuple[str, str, str]]
) -> list[TritonApiClient]:
    """Init Triton connections by the list of addresses.

    Args:
        config (list[tuple[str, str, str]]): The list of Triton services 
        with base url, port and model name.

    Returns:
        list[TritonApiClient]: The list with Triton client objects.
    """
    trtion_api_list = []
    for params in config:
        try:
            trtion_api_list.append(TritonApiClient(*params))
        except Exception as e:
            print(e)
    return trtion_api_list


def make_normalized_pred_obj(pred: str, color: str) -> dict[str, str]:
    """Make an object for the plaftorm.

    Args:
        pred (str): The prediction value.
        color (str): The color hex-code.

    Returns:
        dict[str, str]: A complete object.
    """
    return {"prediction": pred, "color": color}


def normalize_predictions(
    predictions: list[list[str]],
    label_mapping: dict[str, tuple[str, str]],
    separator: str,
    irrelevant_class_name: str,
):
    """Normalize collected predictions fom Triton models into one format.

    It performs label mapping by provided map. 
    If class name is not in map, it rejected.
    If no class left, the irrelevant class will be added.

    If irrelevant class will be with any other class, it will be filtered.

    Args:
        predictions (list[list[str]]): A prediction list per each text.
        label_mapping (dict[str, tuple[str, str]]): The mapping for classes.
        The values are new class name and color hex code.
        separator (str): Separator for multilabel classes.
        irrelevant_class_name (str): The irrelevant class name.

    Returns:
        list[list[str]]: A normalized collection of predictions.
    """

    mapped_predictions = []
    for pred_line in predictions:
        pred_line = [
            label_mapping[x]
            for y in pred_line
            for x in y.split(separator)
            if x in label_mapping
        ]
        # we dont need "irrelevant" prediction if there exist any relevant one
        pred_line = [x for x in pred_line if x[0] != irrelevant_class_name]
        if len(pred_line) == 0:
            pred_line = [label_mapping[irrelevant_class_name]]
        pred_line = [make_normalized_pred_obj(*x) for x in pred_line]
        mapped_predictions.append(pred_line)
    return mapped_predictions
