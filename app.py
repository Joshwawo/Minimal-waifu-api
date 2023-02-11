import os
import torch
from torch import autocast
from flask import Flask, request, jsonify,send_from_directory,url_for
from flask_cors import CORS
from diffusers import StableDiffusionPipeline, StableDiffusionImageVariationPipeline
from PIL import Image
import uuid
import base64

# device = "cuda:0"
pipe = StableDiffusionPipeline.from_pretrained(
    'hakurei/waifu-diffusion',
    torch_dtype=torch.float16,

).to('cuda')

# sd_pipe = StableDiffusionImageVariationPipeline.from_pretrained(
#   "lambdalabs/sd-image-variations-diffusers",
#   revision="v2.0",
# )
# sd_pipe = sd_pipe.to(device)


app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/*": {"origins": "https://example.com"}})

def generate_name():
    uuid_string = str(uuid.uuid4())
    return uuid_string.replace('-', '')+ '.webp'


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
            image = pipe(data["prompt"], guidance_scale=7.7,negative_prompt=data["negative_prompt"],num_inference_steps=100,)
            prompt = data["prompt"]
            filename = f"images/test/{generate_name()}"
            image.images[0].save(filename)
        
        with open(filename, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
            
        return jsonify({"Message": "Complete","prompt":prompt,  "image_data": encoded_string})

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
    # app.run(debug=True, host='localhost', port=5000)
    app.run(debug=True, host='192.168.1.7', port=5000)

# Path: requirements.txt
# transformers==4.5.1
# flask==1.1.2
# flask-cors==3.0.10
# torch==1.8.1
# torchvision==0.9.1
# pillow==8.1.0
# numpy==1.19.5
