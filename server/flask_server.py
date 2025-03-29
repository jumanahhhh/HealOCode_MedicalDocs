import os
import json
import hashlib
import time
from flask import Flask, request, jsonify

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
BLOCKCHAIN_FILE = 'blockchain.json'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def calculate_hash(data):
    return hashlib.sha256(data.encode()).hexdigest()

class Block:
    def __init__(self, index, timestamp, file_hash, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.file_hash = file_hash
        self.previous_hash = previous_hash
        self.hash = self.calculate_block_hash()

    def calculate_block_hash(self):
        data = f"{self.index}{self.timestamp}{self.file_hash}{self.previous_hash}"
        return calculate_hash(data)

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "file_hash": self.file_hash,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }

class Blockchain:
    def __init__(self):
        self.chain = self.load_blockchain()

    def load_blockchain(self):
        if os.path.exists(BLOCKCHAIN_FILE):
            with open(BLOCKCHAIN_FILE, 'r') as f:
                return json.load(f)
        return [self.create_genesis_block()]

    def create_genesis_block(self):
        genesis_block = Block(0, time.time(), "GENESIS_HASH", "0").to_dict()
        self.save_blockchain([genesis_block])
        return genesis_block

    def add_block(self, file_hash):
        previous_block = self.chain[-1]
        new_block = Block(len(self.chain), time.time(), file_hash, previous_block['hash'])
        self.chain.append(new_block.to_dict())
        self.save_blockchain(self.chain)
        return new_block.to_dict()

    def save_blockchain(self, chain):
        with open(BLOCKCHAIN_FILE, 'w') as f:
            json.dump(chain, f, indent=4)

blockchain = Blockchain()

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    with open(file_path, 'rb') as f:
        file_hash = calculate_hash(f.read().hex())
    
    block = blockchain.add_block(file_hash)
    return jsonify({"message": "File uploaded and block added", "block": block})

@app.route('/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify(blockchain.chain)

if __name__ == '__main__':
    app.run(debug=True)
