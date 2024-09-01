import time
from flask import Blueprint, jsonify, request, current_app
import requests
import os
from kingoftheheap.models import Problem,  db, Submission, User
from datetime import datetime

main_bp = Blueprint('main', __name__)

JUDGE0_API_URL = os.getenv("JUDGE0_API_URL")  
JUDGE0_API_KEY = os.getenv("X_AUTH_TOKEN")  

@main_bp.route('/')
def index():
    return jsonify("hello world")

@main_bp.route('/api/daily-problem', methods=['GET'])
def daily_problem():
    problem = Problem.query.order_by(Problem.id.desc()).first()
    if problem:
        return jsonify({"problem": problem.problem})
    else:
        return jsonify({"problem": "No problem available"}), 404

@main_bp.route('/api/run-code', methods=['POST'])
def run_code():
    current_app.logger.info("Received request to /api/run-code")
    current_app.logger.info(f"Request headers: {request.headers}")
    current_app.logger.info(f"Request body: {request.get_data()}")

    data = request.json
    code = data.get('code')
    if not code:
        current_app.logger.error("No code provided in request")
        return jsonify({"error": "No code provided"}), 400

    # Prepare the submission for Judge0
    judge0_payload = {
        "source_code": code,
        "language_id": 54,  # ID for C++
        "cpu_time_limit": 3,  # 3 seconds
    }

    headers = {
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-Auth-Token": os.getenv("X_AUTH_TOKEN"),
        "Content-Type": "application/json"
    }

    # Submit to Judge0
    try:
        response = requests.post(f"{os.getenv('JUDGE0_API_URL')}/submissions", json=judge0_payload, headers=headers, timeout=30, verify=False)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Error making request to Judge0: {e}")
        return jsonify({"error": "Failed to submit code to Judge0"}), 500

    submission_token = response.json()['token']
    current_app.logger.info(f"Received submission token: {submission_token}")

    # Wait for the result
    result = None
    for i in range(10):  # Try 10 times
        try:
            result_response = requests.get(
                f"{os.getenv('JUDGE0_API_URL')}/submissions/{submission_token}",
                headers=headers,
                verify=False,
                params={"base64_encoded": "false", "fields": "stdout,status_id,status"}
            )
            current_app.logger.info(f"Status check response: {result_response.status_code}")
            current_app.logger.info(f"Status check headers: {result_response.headers}")
            current_app.logger.info(f"Status check body: {result_response.text}")
            
            result_response.raise_for_status()
            result = result_response.json()
            if result['status']['id'] not in [1, 2]:  # If not In Queue or Processing
                break
            current_app.logger.info(f"Attempt {i+1}: Submission still processing")
            time.sleep(1)  # Wait for 1 second before trying again
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error checking submission status: {e}")
            if i == 9:  # If this is the last attempt
                return jsonify({"error": "Failed to check submission status after multiple attempts"}), 500
        
    if not result or result['status']['id'] in [1, 2]:
        current_app.logger.error("Judging timed out")
        return jsonify({"error": "Judging timed out"}), 504

    # Process the result
    status = result['status']['description']
    stdout = result.get('stdout', '')
    
    current_app.logger.info(f"Code execution completed. Status: {status}")
    return jsonify({
        "status": status,
        "stdout": stdout,
    }), 200
     
@main_bp.route('/api/submit-code', methods=['POST'])
def submit_code():
    data = request.json
    code = data.get('code')
    
    # # Fetch the current problem
    # problem = Problem.query.order_by(Problem.id.desc()).first()
    # if not problem:
    #     return jsonify({"error": "No active problem found"}), 404

    #MOCK USER 
    # Ensure a user exists
    user = User.query.filter_by(id=1).first()
    if not user:
        user = User(id=1, username="testuser", password_hash="asdf", email="testuser@example.com")
        db.session.add(user)
        db.session.commit()
    #THIS IS A MOCK 
    problem= Problem(
        description="""
        You are given an array of integers, and your task is to find the sum of the largest contiguous subarray.
        
        **Example:**
        ```
        Input: [-2,1,-3,4,-1,2,1,-5,4]
        Output: 6
        Explanation: The subarray [4,-1,2,1] has the largest sum = 6.
        ```
        """,
        id=1,
    )
    # Prepare the submission for Judge0
    judge0_payload = {
        "source_code": code,
        "language_id": 54,  # ID for C++
        "cpu_time_limit": 3,  # 3 seconds
    }

    headers = {
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-Auth-Token": os.getenv("X_AUTH_TOKEN"),
        "Content-Type": "application/json"
    }

    # Submit to Judge0
    response = requests.post(f"{JUDGE0_API_URL}/submissions", json=judge0_payload, headers=headers)
    
    if response.status_code != 201:
        return jsonify({"error": "Failed to submit code to Judge0"}), 500

    submission_token = response.json()['token']

    # Wait for the result (you might want to implement polling or webhooks for production)
    result = None
    for _ in range(10):  # Try 10 times
        result_response = requests.get(f"{JUDGE0_API_URL}/submissions/{submission_token}", headers=headers)
        if result_response.status_code == 200:
            result = result_response.json()
            if result['status']['id'] not in [1, 2]:  # If not In Queue or Processing
                break
        time.sleep(1)  # Wait for 1 second before trying again

    if not result or result['status']['id'] in [1, 2]:
        return jsonify({"error": "Judging timed out"}), 504

    # Process the result
    status = result['status']['description']
    runtime = result.get('time', 0)
    memory = result.get('memory', 0)
    stdout = result.get('stdout', '')

    # Save submission to database
    submission = Submission(
        problem_id=problem.id,
        user_id=1, #FIX ME
        code=code,
        status=status,
        runtime=runtime,
        memory=memory,
        created_at=datetime.utcnow()
    )
    db.session.add(submission)
    db.session.commit()

    # Check if this is the new best submission
    # if status == "Accepted" and execution_time < problem.best_time:
    #     problem.best_time = execution_time
    #     problem.best_submission_id = submission.id
    db.session.commit()

    return jsonify({
        "status": status,
        "execution_time": runtime,
        "memory_used": memory,
        "stdout": stdout
    }), 200
