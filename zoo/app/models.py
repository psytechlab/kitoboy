"""The module with Pydantic data models."""
from pydantic import BaseModel


class TextList(BaseModel):
    """The simple structure for text input"""
    text_list: list[str]


class TextToPredict(BaseModel):
    """Object from platform.

    text_id - text id in platform BD.
    text - text to be predicted
    """
    text_id: str
    text: str


class ServiceInput(BaseModel):
    """Expected input from the platform"""
    texts: list[TextToPredict]


class TritonServerAddr(BaseModel):
    """The tuple with address of Triton model service.
    
    url - base url.
    port - port of the service.
    model_name - model name that Triton has.
    """
    url: str
    port: str
    model_name: str
