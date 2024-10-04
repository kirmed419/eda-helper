import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import pandas as pd
import numpy as np

def create_plot(data, target_column, feature_columns, progress_callback=None):
    plots = []
    correlations = []
    
    for i, feature in enumerate(feature_columns):
        plt.figure(figsize=(10, 6))
        if data[feature].dtype == 'object':
            sns.boxplot(x=feature, y=target_column, data=data)
        else:
            sns.regplot(x=data[feature], y=data[target_column], scatter_kws={'alpha':0.5})
        plt.title(f'{feature} vs {target_column}')
        plt.xlabel(feature)
        plt.ylabel(target_column)
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plot = base64.b64encode(buffer.getvalue()).decode()
        plots.append(plot)
        plt.close()
        
        if data[feature].dtype == 'object':
            correlation = data[feature].nunique() / len(data)  # Cardinality ratio for categorical variables
        else:
            correlation = np.abs(data[feature].corr(data[target_column]))  # Absolute correlation
        correlations.append({'feature': feature, 'correlation': correlation})
        
        if progress_callback:
            progress = int((i + 1) / len(feature_columns) * 100)
            progress_callback(progress)
    
    correlations.sort(key=lambda x: x['correlation'], reverse=True)
    
    return plots, correlations

def preprocess_data(samples):
    return pd.DataFrame(samples)