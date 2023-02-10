import os
import torch
from torch import autocast
from flask import Flask, request, jsonify,send_from_directory,url_for
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import uuid
import base64


pipe = StableDiffusionPipeline.from_pretrained(
    'hakurei/waifu-diffusion',
    torch_dtype=torch.float16,

).to('cuda')


app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/*": {"origins": "https://example.com"}})

def generate_name():
    uuid_string = str(uuid.uuid4())
    return uuid_string.replace('-', '')+ '.png'


@app.route("/prompt", methods=['POST'])
def prompti():
    if request.method == 'POST':
        data = request.get_json()
        with autocast("cuda"):
            image = pipe(data["prompt"], guidance_scale=6)
            image.images[0].save(f"otras/{generate_name()}")
        return jsonify({"Message": "Complete"})


@app.route("/prompt/image", methods=['POST'])
def image_base64():
    if request.method == 'POST':
        data = request.get_json()
        with autocast("cuda"):
            image = pipe(data["prompt"], guidance_scale=6)
            filename = f"img-base64/{generate_name()}"
            image.images[0].save(filename)
        
        with open(filename, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
            
        return jsonify({"Message": "Complete", "image_data": encoded_string})

@app.route('/img/<path:filename>', methods=['GET'])
def serve_images(filename):
    return send_from_directory('img-base64', filename)   

@app.route("/allimg", methods=['GET'])
def allimg():
    images = [image for image in os.listdir('img-base64') if image.endswith('.png')]
    return jsonify(images)

@app.route('/all', methods=['GET'])
def get_images():
    images = [{'url': url_for('get_images', filename=image), 'filename': image} for image in os.listdir('img-base64') if image.endswith('.png')]
    return jsonify(images)

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)

# Path: requirements.txt
# transformers==4.5.1
# flask==1.1.2
# flask-cors==3.0.10
# torch==1.8.1
# torchvision==0.9.1
# pillow==8.1.0
# numpy==1.19.5
