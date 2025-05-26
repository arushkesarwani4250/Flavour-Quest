import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np

# Expanded food category mappings (ImageNet labels -> common names)
FOOD_MAPPINGS = {
    # Western Foods
    'hotdog': 'hot dog',
    'hamburger': 'burger',
    'cheeseburger': 'burger',
    'french_fries': 'fries',
    'pizza': 'pizza',
    'meat_loaf': 'meatloaf',
    'burrito': 'burrito',
    'taco': 'taco',

    # Asian Foods
    'sushi': 'sushi',
    'ramen': 'ramen',
    'fried_rice': 'fried rice',
    'dumpling': 'dumplings',

    # Italian
    'spaghetti': 'pasta',
    'lasagna': 'lasagna',
    'ravioli': 'ravioli',

    # Healthy
    'green_salad': 'salad',
    'caesar_salad': 'salad',
    'guacamole': 'guacamole',

    # Breakfast
    'pancake': 'pancakes',
    'waffle': 'waffles',
    'omelette': 'omelette',

    # Desserts
    'ice_cream': 'ice cream',
    'chocolate_cake': 'chocolate cake',
    'apple_pie': 'apple pie'
}

model = EfficientNetB0(weights='imagenet')


def predict_food(img_path):
    """Predicts food with enhanced category handling"""
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)

        preds = model.predict(x)
        decoded = tf.keras.applications.imagenet_utils.decode_predictions(preds, top=5)[0]

        # Find first matching food
        for _, label, prob in decoded:
            clean_label = label.lower()
            if clean_label in FOOD_MAPPINGS:
                return FOOD_MAPPINGS[clean_label], float(prob)

        return "unknown", 0.0

    except Exception as e:
        print(f"Prediction error: {e}")
        return "error", 0.0