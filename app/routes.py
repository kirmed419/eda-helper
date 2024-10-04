import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

from flask import Blueprint, render_template, request, jsonify, Response
from app.models import Data, Model
from app.utils import create_plot, preprocess_data
import json

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if file:
        try:
            Data.load_data(file)
            return jsonify({
                'columns': Data.get_columns(),
                'redirect': '/analyze'
            })
        except Exception as e:
            return jsonify({'error': f'Error loading file: {str(e)}'}), 400
    return jsonify({'error': 'No file uploaded'}), 400

@main.route('/analyze', methods=['POST'])
def analyze():
    target_column = request.form.get('target')
    feature_columns = request.form.getlist('features')
    
    if Data.data is None or Data.data.empty or not target_column or not feature_columns:
        return jsonify({'error': 'Missing data or columns'}), 400

    try:
        Data.set_target_and_features(target_column, feature_columns)

        def generate():
            def progress_callback(progress):
                yield f"data: {json.dumps({'progress': progress})}\n\n"

            plots, correlations = create_plot(Data.data, target_column, feature_columns, progress_callback)
            yield f"data: {json.dumps({'plots': plots, 'correlations': correlations})}\n\n"

        return Response(generate(), content_type='text/event-stream')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main.route('/train', methods=['POST'])
def train():
    # Ensure data and columns are set before training
    if Data.data is None or Data.data.empty or Data.target_column is None or Data.feature_columns is None:
        return jsonify({'error': 'Missing data or columns'}), 400

    try:
        train_test_ratio = float(request.json.get('train_test_ratio', 0.8))  # Default ratio is 0.8

        # Call the training method and retrieve results
        results = Model.train_and_evaluate(train_test_ratio)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main.route('/predict', methods=['POST'])
def predict():
    # Ensure model is trained before prediction
    if Model.model is None:
        return jsonify({'error': 'Model not trained'}), 400

    try:
        if request.json and 'samples' in request.json:
            samples = preprocess_data(request.json['samples'])  # Preprocess input samples
            predictions = Model.model.predict(samples)
            return jsonify({'predictions': predictions.tolist()})
        else:
            results = Model.predict_on_dataset()  # Predict on the whole dataset
            return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
