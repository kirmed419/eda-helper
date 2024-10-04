from flask import Flask
from config import Config
import os

def create_app():
    app = Flask(__name__, 
                template_folder=os.path.abspath('templates'),
                static_folder=os.path.abspath('static'))
    app.config.from_object(Config)

    from app import routes
    app.register_blueprint(routes.main)

    return app