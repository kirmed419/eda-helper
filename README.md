# Data Analysis Web App

## Overview

This Data Analysis Web App is a full-stack application that allows users to upload datasets, perform exploratory data analysis, train machine learning models, and make predictions. It combines the power of data science with the accessibility of a web interface, making it easy for users to gain insights from their data.

## Features

- CSV file upload and parsing
- Interactive data visualization using Matplotlib and Seaborn
- Correlation analysis between features
- Gradient Boosting Regression model training
- Real-time prediction on new samples
- Responsive web design using Tailwind CSS

## Tech Stack

- Frontend: HTML, CSS (Tailwind), JavaScript
- Backend: Python, Flask
- Data Science: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/kirmed419/eda-helper.git
   cd eda-helper
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up the Flask environment variables:
   ```
   export FLASK_APP=app
   export FLASK_ENV=development
   ```
   On Windows, use `set` instead of `export`.

## Usage

1. Start the Flask development server:
   ```
   flask run
   ```

2. Open a web browser and navigate to `http://localhost:5000`.

3. Upload a CSV file using the "Upload Dataset" form.

4. Select the target variable and feature variables for analysis.

5. Click "Analyze" to generate visualizations and correlation data.

6. Train the Gradient Boosting model using the "Train Gradient Boosting Model" button.

7. Upload a new CSV file with the same feature columns to make predictions using the trained model.

## Project Structure

```
data-analysis-web-app/
│
├── app/
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   └── utils.py
│
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── main.js
│
├── templates/
│   └── index.html
│
├── requirements.txt
└── README.md
```

## Contributing

Contributions to this project are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive commit messages.
4. Push your changes to your fork.
5. Submit a pull request to the main repository.

Please ensure your code adheres to the existing style and passes all tests.

## Acknowledgments

- Flask documentation
- Scikit-learn documentation
- Matplotlib and Seaborn for data visualization
- Tailwind CSS for responsive design

## Contact

If you have any questions or suggestions, please open an issue on GitHub or contact me kirouanemed@protonmail.com.

Happy analyzing!
