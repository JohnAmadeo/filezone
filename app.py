from flask import Flask, render_template, request, redirect
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

UPLOAD_URL = 'https://filezone.blob.core.windows.net/filezone-static/pdf/'

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    pdf_dictionary = request.files
    pdf_keys = pdf_dictionary.keys()
    for key in pdf_keys:
        pdf_object = pdf_dictionary[key]
        # pdf_object.save('/tmp/random.pdf')
        pdf_object.save(key)

    return ''

if __name__ == '__main__':
    app.run(debug=True)

