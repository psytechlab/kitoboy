import unittest
from unittest.mock import patch
from app.main import collect_predictions
from app.models import ServiceInput, TextToPredict, TextList

class TestCollectPredictions(unittest.TestCase):
    def setUp(self):
        self.label_mapping = {
            "class1": ("mapped_class1", "#FF0000"),
            "class2": ("mapped_class2", "#00FF00"),
            "нерелевантный": ("нерелевантный", "#CCCCCC")
        }
        
        self.test_input = ServiceInput(texts=[
            TextToPredict(text_id="1", text="text1"),
            TextToPredict(text_id="2", text="text2")
        ])

        self.expected_output = {
            "texts": [
                {
                    "id": "1",
                    "predictions": [
                        {"prediction": "mapped_class1", "color": "#FF0000"}
                    ]
                },
                {
                    "id": "2",
                    "predictions": [
                        {"prediction": "mapped_class2", "color": "#00FF00"}
                    ]
                }
            ]
        }

    @patch('app.main.process_text')
    @patch('requests.post')
    def test_collect_predictions_with_sending(self, mock_post, mock_process_text):
        mock_process_text.return_value = [["class1"], ["class2"]]
        
        mock_post.return_value.status_code = 200

        endpoint = "http://example.ru/predictions"
        collect_predictions(self.test_input, self.label_mapping, endpoint)

        mock_process_text.assert_called_once_with(
            TextList(text_list=["text1", "text2"])
        )

        mock_post.assert_called_once_with(
            endpoint,
            json=self.expected_output
        )

    @patch('app.main.process_text')
    @patch('requests.post')
    def test_collect_predictions_without_sending(self, mock_post, mock_process_text):
        mock_process_text.return_value = [["class1"], ["class2"]]

        collect_predictions(self.test_input, self.label_mapping)

        mock_process_text.assert_called_once_with(
            TextList(text_list=["text1", "text2"])
        )

        mock_post.assert_not_called()

    @patch('app.main.process_text')
    @patch('requests.post')
    def test_collect_predictions(self, mock_post, mock_process_text):
        mock_process_text.return_value = [["нерелевантный"], ["class1"]]

        expected_output = {
            "texts": [
                {
                    "id": "1",
                    "predictions": [
                        {"prediction": "нерелевантный", "color": "#CCCCCC"}
                    ]
                },
                {
                    "id": "2",
                    "predictions": [
                        {"prediction": "mapped_class1", "color": "#FF0000"}
                    ]
                }
            ]
        }

        endpoint = "http://example.ru/predictions"
        collect_predictions(self.test_input, self.label_mapping, endpoint)

        mock_post.assert_called_once_with(
            endpoint,
            json=expected_output
        )

    @patch('app.main.process_text')
    @patch('requests.post')
    def test_collect_predictions_error_handling(self, mock_post, mock_process_text):
        mock_process_text.return_value = [["class1"], ["class2"]]
        
        mock_post.side_effect = Exception("Connection error")

        endpoint = "http://example.ru/predictions"
        
        with self.assertRaises(Exception) as context:
            collect_predictions(self.test_input, self.label_mapping, endpoint)

        self.assertTrue('Connection error' in str(context.exception))

    @patch('app.main.process_text')
    @patch('requests.post')
    def test_collect_predictions_multiple_predictions(self, mock_post, mock_process_text):
        mock_process_text.return_value = [["class1;class2"], ["class2;нерелевантный"]]

        expected_output = {
            "texts": [
                {
                    "id": "1",
                    "predictions": [
                        {"prediction": "mapped_class1", "color": "#FF0000"},
                        {"prediction": "mapped_class2", "color": "#00FF00"}
                    ]
                },
                {
                    "id": "2",
                    "predictions": [
                        {"prediction": "mapped_class2", "color": "#00FF00"}
                    ]
                }
            ]
        }

        endpoint = "http://example.ru/predictions"
        collect_predictions(self.test_input, self.label_mapping, endpoint)

        mock_post.assert_called_once_with(
            endpoint,
            json=expected_output
        )

if __name__ == '__main__':
    unittest.main()
