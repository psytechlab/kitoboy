from pydantic import BaseModel

class TextList(BaseModel):
    text_list : list[str]

class TextToPredict(BaseModel):
    text_id: str
    text: str

class ServiceInput(BaseModel):
    texts : list[TextToPredict]


class TritonServerAddr(BaseModel):
    ip_addr: str
    port: str
    model_name: str
