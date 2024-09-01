from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    # Ensure that the instance folder and config file are correctly set up
    app.config.from_object('instance.config.Config')

    # Initialize the database connection
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register Blueprints here to avoid circular imports
    from kingoftheheap.routes import main_bp
    app.register_blueprint(main_bp)

    # Create all tables
    with app.app_context():
        db.create_all()

    return app