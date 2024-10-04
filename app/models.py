import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error

class Data:
    data = None
    target_column = None
    feature_columns = None

    @classmethod
    def load_data(cls, file):
        cls.data = pd.read_csv(file)

    @classmethod
    def get_columns(cls):
        if cls.data is None:
            return []
        return [{'name': col, 'dtype': str(cls.data[col].dtype)} for col in cls.data.columns]

    @classmethod
    def set_target_and_features(cls, target_column, feature_columns):
        cls.target_column = target_column
        cls.feature_columns = feature_columns

class Model:
    model = None
    preprocessor = None

    @classmethod
    def train_and_evaluate(cls, train_test_ratio):
        if Data.data is None or Data.target_column is None or Data.feature_columns is None:
            raise ValueError("Data not loaded or target/feature columns not set")

        X = Data.data[Data.feature_columns]
        y = Data.data[Data.target_column]
        
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_features = X.select_dtypes(include=['object']).columns
        
        cls.preprocessor = ColumnTransformer(
            transformers=[
                ('num', MinMaxScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])
        
        cls.model = Pipeline([
            ('preprocessor', cls.preprocessor),
            ('regressor', GradientBoostingRegressor(random_state=42))
        ])
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=train_test_ratio, random_state=42)
        
        cls.model.fit(X_train, y_train)
        
        train_predictions = cls.model.predict(X_train)
        test_predictions = cls.model.predict(X_test)
        
        train_score = cls.model.score(X_train, y_train)
        test_score = cls.model.score(X_test, y_test)
        train_mse = mean_squared_error(y_train, train_predictions)
        test_mse = mean_squared_error(y_test, test_predictions)
        train_mae = mean_absolute_error(y_train, train_predictions)
        test_mae = mean_absolute_error(y_test, test_predictions)
        
        preprocessed_X = cls.preprocessor.fit_transform(X)
        preprocessed_shape = preprocessed_X.shape if isinstance(preprocessed_X, np.ndarray) else preprocessed_X.toarray().shape
        
        return {
            'train_score': train_score,
            'test_score': test_score,
            'train_mse': train_mse,
            'test_mse': test_mse,
            'train_mae': train_mae,
            'test_mae': test_mae,
            'preprocessed_shape': preprocessed_shape
        }

    @classmethod
    def predict_on_dataset(cls):
        if Data.data is None or Data.target_column is None or Data.feature_columns is None:
            raise ValueError("Data not loaded or target/feature columns not set")
        if cls.model is None:
            raise ValueError("Model not trained")

        X = Data.data[Data.feature_columns]
        y = Data.data[Data.target_column]
        
        predictions = cls.model.predict(X)
        errors = np.abs(predictions - y)
        
        results = []
        for i in range(len(predictions)):
            results.append({
                'actual': float(y.iloc[i]),
                'predicted': float(predictions[i]),
                'error': float(errors[i])
            })
        
        return results