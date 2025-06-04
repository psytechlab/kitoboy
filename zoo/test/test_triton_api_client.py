import unittest
import requests
from unittest.mock import Mock, patch
from app.triton_api_client import TritonApiClient

class TestTritonApiClient(unittest.TestCase):
    def setUp(self):
        self.patcher = patch('requests.Session')
        self.mock_session = self.patcher.start()
        
        self.mock_session.return_value.get.return_value.status_code = 200
        self.mock_session.return_value.get.return_value.json.return_value = {
            "max_batch_size": 32
        }

    def tearDown(self):
        self.patcher.stop()

    def test_init_success(self):
        client = TritonApiClient("http://localhost", 8000, "test_model")
        
        self.assertEqual(self.mock_session.call_count, 1)
        self.assertEqual(client.base, "http://localhost:8000/v2")
        self.assertEqual(client.model_name, "test_model")
        self.assertEqual(client.max_batch_size, 32)

    def test_init_failure(self):
        self.mock_session.return_value.get.return_value.status_code = 500
        self.mock_session.return_value.get.return_value.raise_for_status.side_effect = requests.exceptions.HTTPError
        
        with self.assertRaises(requests.exceptions.HTTPError):
            TritonApiClient("http://localhost", 8000, "test_model")

    def test_is_ready(self):
        client = TritonApiClient("http://localhost", 8000, "test_model")
        
        self.mock_session.return_value.get.return_value.status_code = 200
        self.assertTrue(client.is_ready())
        
        self.mock_session.return_value.get.return_value.status_code = 503
        self.assertFalse(client.is_ready())

    def test_make_object(self):
        client = TritonApiClient("http://localhost", 8000, "test_model")
        test_texts = ["text1", "text2"]
        
        result = client._make_object(test_texts)
        
        expected = {
            "inputs": [{
                "name": "text_input",
                "shape": [2, 1],
                "datatype": "BYTES",
                "data": ["text1", "text2"]
            }]
        }
        self.assertEqual(result, expected)

    def test_make_prediction_on_batch(self):
        client = TritonApiClient("http://localhost", 8000, "test_model")
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "outputs": [{
                "data": ["pred1", "pred2"]
            }]
        }
        self.mock_session.return_value.post.return_value = mock_response
        
        result = client.make_prediction_on_batch(["text1", "text2"])
        
        self.assertEqual(result, ["pred1", "pred2"])
        self.mock_session.return_value.post.assert_called_once()


    def test_make_prediction(self):
        client = TritonApiClient("http://localhost", 8000, "test_model")
        client.max_batch_size = 2 
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "outputs": [{
                "data": ["pred1", "pred2"]
            }]
        }
        self.mock_session.return_value.post.return_value = mock_response
        
        result = client.make_prediction(["text1", "text2", "text3", "text4"])
        
        self.assertEqual(self.mock_session.return_value.post.call_count, 2)

    def test_close_connection(self):
        client = TritonApiClient("http://localhost", 8000, "test_model")
        client.close_connection()
        
        self.assertIsNone(client.sess)
        self.mock_session.return_value.close.assert_called_once()

if __name__ == '__main__':
    unittest.main()
