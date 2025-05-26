from flask import Flask, render_template, request, redirect
from werkzeug.utils import secure_filename
from food_recognition import predict_food
import os
import json

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def get_recipe(food_name):
    with open('recipes_db.json') as f:
        recipes = json.load(f)
    return recipes.get(food_name.lower(), {
        "title": food_name.title(),
        "ingredients": ["Customize based on your taste"],
        "instructions": [
            f"1. Prepare {food_name} ingredients",
            "2. Cook as preferred",
            "3. Serve and enjoy!"
        ]
    })


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(save_path)

            food_name, confidence = predict_food(save_path)
            recipe = get_recipe(food_name)

            return render_template('result.html',
                                   food_name=food_name.title(),
                                   confidence=f"{confidence:.0%}",
                                   image=filename,
                                   recipe=recipe)

    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)