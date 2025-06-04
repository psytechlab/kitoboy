import unittest
from unittest.mock import patch,  MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models import TextList, ServiceInput, TextToPredict, TritonServerAddr
from app.utils import normalize_predictions


class TestTritonAPI(unittest.TestCase):
    def setUp(self):
        self.triton_services_data = [
            ("http://example1.ru", "8000", "model1"),
            ("http://example2.ru", "8001", "model2")
        ]
        
        self.mapping_data = {
            "класс1": ("mapped_class1", "#FF0000"),
            "нерелевантный": ("нерелевантный", "#CCCCCC"),
            "класс2": ("mapped_class2", "#00FF00")
        }
        
        self.config_data = {
            "endpoint_to_send_preds": "http://prediction-endpoint.ru"
        }

        self.client = TestClient(app)

        self.yaml_patcher = patch('builtins.open')
        self.mock_open = self.yaml_patcher.start()
        
        def mock_yaml_load(stream, *args, **kwargs):
            if 'triton_services.yml' in str(stream):
                return self.triton_services_data
            elif 'mapping.yml' in str(stream):
                return self.mapping_data
            elif 'config.yml' in str(stream):
                return self.config_data
            return None

        self.yaml_load_patcher = patch('yaml.safe_load', side_effect=mock_yaml_load)
        self.mock_yaml_load = self.yaml_load_patcher.start()

    def tearDown(self):
        self.yaml_patcher.stop()
        self.yaml_load_patcher.stop()

    def test_normalize_predictions(self):
        predictions = [
            ["класс1;класс2"],
            ["нерелевантный"]
        ]
        
        expected_output = [
            [
                {"prediction": "mapped_class1", "color": "#FF0000"},
                {"prediction": "mapped_class2", "color": "#00FF00"}
            ],
            [
                {"prediction": "нерелевантный", "color": "#CCCCCC"}
            ]
        ]
        
        result = normalize_predictions(predictions, self.mapping_data)
        self.assertEqual(result, expected_output)

    def test_connect_server(self):
        server_data = TritonServerAddr(
            url="http://example.ru",
            port="8000",
            model_name="test_model"
        )
        
        response = self.client.post("/connect_server", json=server_data.model_dump())
        self.assertEqual(response.status_code, 200)



    def test_process_text(self):
        test_data = TextList(text_list=["sample text"])
        
        app.state.triton_model_list = [MagicMock()]
        app.state.triton_model_list[0].make_prediction.return_value = ["pred1"]
        
        response = self.client.post("/predict", json=test_data.model_dump())
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [["pred1"]])

    def test_process_text_list(self):
        test_data = TextList(text_list=["sample text"])
        
        app.state.triton_model_list = [MagicMock()]
        app.state.triton_model_list[0].make_prediction.return_value = ["класс1"]
        app.state.label_mapping = self.mapping_data
        
        response = self.client.post("/predict_on_text", json=test_data.model_dump())
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [["mapped_class1"]])
         
    def test_show_services(self):
        app.state.triton_model_list = [
            MagicMock(base="http://example1.ru:8000/v2", model_name="model1"),
            MagicMock(base="http://example2.ru:8001/v2", model_name="model2")
        ]

        expected_response = [
            {"url": "http://example1.ru:8000/v2", "model_name": "model1"},
            {"url": "http://example2.ru:8001/v2", "model_name": "model2"}
        ]

        response = self.client.get("/show_services")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), expected_response)

    def test_show_services_empty(self):
        app.state.triton_model_list = []

        response = self.client.get("/show_services")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_update_platform_endpoint(self):
        app.state.config = {"endpoint_to_send_preds": "http://old-endpoint.ru"}
        
        new_endpoint = "http://new-endpoint.ru"
        response = self.client.put(f"/update_platform_endpoint?new_endpoint={new_endpoint}")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(app.state.config["endpoint_to_send_preds"], new_endpoint)

    def test_update_platform_endpoint_to_none(self):
        app.state.config = {"endpoint_to_send_preds": "http://old-endpoint.ru"}
        
        response = self.client.put("/update_platform_endpoint?new_endpoint=")
        
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(app.state.config["endpoint_to_send_preds"])

    @patch('app.main.collect_predictions')
    def test_predict_on_batch(self, mock_collect):
        test_data = ServiceInput(texts=[
            TextToPredict(text_id="1", text="text1"),
            TextToPredict(text_id="2", text="text2")
        ])
        
        response = self.client.post("/predict_on_batch", json=test_data.model_dump())
        
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json(), {"status": "texts received"})
    
    @patch('app.main.collect_predictions')
    def test_predict_on_batch_invalid_data(self, mock_collect_predictions):
        test_data = {
            "texts": [
                {"text": "missing text_id"},
                {"text_id": "missing text"}
            ]
        }

        response = self.client.post(
            "/predict_on_batch",
            json=test_data
        )

        self.assertEqual(response.status_code, 422) 

    @patch('app.main.collect_predictions')
    def test_predict_on_batch_without_endpoint(self, mock_collect_predictions):
        test_data = {
            "texts": [
                {"text_id": "1", "text": "sample text"}
            ]
        }

        app.state.config = {"endpoint_to_send_preds": None}

        response = self.client.post(
            "/predict_on_batch",
            json=test_data
        )

        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.json(), {"status": "texts received"})


if __name__ == '__main__':
    unittest.main()
