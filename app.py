from flask import Flask, render_template, request, redirect, make_response
from azure.storage.blob import BlockBlobService, ContentSettings
import os

app = Flask(__name__)

AZURE_CONTAINER_URL = 'https://filezone.blob.core.windows.net/filezone-static/pdf/'

@app.route('/')
def hello_world():
    return render_template('index.html')    

@app.route('/upload', methods=['POST'])
def upload():
    user_id = request.headers['userid']
    pdf_dictionary = request.files
    pdf_keys = pdf_dictionary.keys()
    for key in pdf_keys:
        pdf_object = pdf_dictionary[key]
        pdf_object.save('/tmp/' + key)
        pdf_object.save(key)
        storePDFInAzure('/tmp/' + key, key, user_id)

    return make_response()

def storePDFInAzure(local_path_to_file, filename, user_id):
    block_blob_service = BlockBlobService(
        account_name='filezone',
        account_key=os.environ['AZURE_FILEZONE_KEY']
    )

    print('Uploading ' + filename)
    block_blob_service.create_blob_from_path(
        container_name='filezone-static',
        blob_name='pdf/' + user_id + '/' + filename,
        file_path=local_path_to_file,
        content_settings=ContentSettings(content_type='application/pdf')
    )
    print('Successfully uploaded ' + filename)

if __name__ == '__main__':
    app.run(debug=True)

