from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Problem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submissions = db.relationship('Submission', backref='problem', lazy=True)
    kings = db.relationship('King', backref='king_problem', lazy=True)  # Changed backref name
    finalized_kings = db.relationship('FinalizedKing', backref='finalized_problem', lazy=True)  # Changed backref name

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submissions = db.relationship('Submission', backref='user', lazy=True)
    kings = db.relationship('King', backref='king_user', lazy=True)  # Changed backref name
    finalized_kings = db.relationship('FinalizedKing', backref='finalized_user', lazy=True)  # Changed backref name
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('problem.id'), nullable=False)
    code = db.Column(db.Text, nullable=False)
    output = db.Column(db.Text, nullable=True)
    runtime = db.Column(db.Float, nullable=True)
    memory = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(64), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class King(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('problem.id'), nullable=False)
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'), nullable=False)
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('user_kings', lazy=True))  # Changed backref name
    problem = db.relationship('Problem', backref=db.backref('problem_kings', lazy=True))  # Changed backref name
    submission = db.relationship('Submission', backref=db.backref('king_submission', uselist=False))  # Changed backref name

class FinalizedKing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('problem.id'), nullable=False)
    submission_id = db.Column(db.Integer, db.ForeignKey('submission.id'), nullable=False)
    finalized_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('finalized_user_kings', lazy=True))  # Changed backref name
    problem = db.relationship('Problem', backref=db.backref('finalized_problem_kings', lazy=True))  # Changed backref name
    submission = db.relationship('Submission', backref=db.backref('finalized_king_submission', uselist=False))  # Changed backref name