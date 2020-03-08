from flask import Flask
from flask_cors import CORS
import logging


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)

    # Load configuration from default_config.py, overwrite with instance/config.cfg if it exists
    try:
        app.config.from_object('ratemydorm.default_config.Config')
        app.config.from_pyfile('config.cfg')
    except IOError:
        print("instance/config.cfg was not found. Using default settings")

    # Import routes
    from .routes import auth
    from .routes import example
    from .routes import status
    # Register routes
    app.register_blueprint(auth.bp)
    app.register_blueprint(example.bp)
    app.register_blueprint(status.bp)

    logging.basicConfig(format='%(asctime)s-%(levelname)s: %(message)s',
                        datefmt='%m/%d/%y %H:%M:%S',
                        level=app.config['LOG_LEVEL'])
    return app
