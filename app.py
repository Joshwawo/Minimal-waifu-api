import datetime
import os
from config import MY_ENV_VAR
import torch
from torch import autocast
from flask import Flask, request, jsonify,send_from_directory,url_for
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import uuid
import base64
from pymongo import MongoClient

#Pls, refactor this code to a class, I'm not a python developer

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
pipe = StableDiffusionPipeline.from_pretrained(
    'hakurei/waifu-diffusion',
    torch_dtype=torch.float16,
).to('cuda')
pipe.enable_attention_slicing(1)
pipe.enable_sequential_cpu_offload()
pipe.enable_xformers_memory_efficient_attention()

## MongoDB
client = MongoClient(MY_ENV_VAR)
db = client["waifu_difusion"]
collectionPrompts = db["prompts"]


app = Flask(__name__)
#middlewares
CORS(app)
# CORS(app, resources={r"/*": {"origins": "https://example.com"}})

def generate_name():
    uuid_string = str(uuid.uuid4())
    return uuid_string.replace('-', '')+ '.webp'



@app.route("/prompt", methods=['POST'])
def prompti():
    if request.method == 'POST':
        body = request.get_json()
        with autocast("cuda"):
            image = pipe(body["prompt"], guidance_scale=6)
            image.images[0].save(f"otras/{generate_name()}")
        return jsonify({"Message": "Complete"})

@app.route("/all-prompts", methods=['GET'])
def get_all_prompts():
    prompts_query = collectionPrompts.find()
    prompts = []
    for prompt in prompts_query:
        prompts_object = {
            "_id": str(prompt["_id"]),
            "prompt": prompt["prompt"],
            "negative_prompt": prompt["negative_prompt"],
            "image_data": prompt["image_data"]
        }
        prompts.append(prompts_object)
    return jsonify(prompts)


@app.route("/prompt/image", methods=['POST'])
def image_base64():
    if request.method == 'POST':
        body = request.get_json()
        with autocast("cuda"):
            prompt = body["prompt"]
            negative_prompt = body["negative_prompt"]
            steps = int(body["steps"])
            created = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            image = pipe(prompt, guidance_scale=7.7,negative_prompt=negative_prompt,num_inference_steps=steps)
            filename = f"images/opt/{generate_name()}"
            image.images[0].save(filename)
        
        with open(filename, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        collectionPrompts.insert_one({"prompt": prompt, "negative_prompt": negative_prompt, "image_data": encoded_string, "created": created})
        return jsonify({"Message": "Complete","prompt":prompt, "negative_prompt": negative_prompt ,"image_data": encoded_string})

@app.route('/img/<path:filename>', methods=['GET'])
def serve_images(filename:str):
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
