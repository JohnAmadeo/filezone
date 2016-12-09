from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response
from azure.storage.blob import BlockBlobService, ContentSettings
import os
import json

app = Flask(__name__)

BLOCK_BLOB_SERVICE = BlockBlobService(
    account_name='filezone',
    account_key=os.environ['AZURE_FILEZONE_KEY']
)

@app.route('/')
def hello_world():
    return render_template('index.html')    

@app.route('/upload', methods=['POST'])
def upload():
    user_id = request.headers['userid']
    pdf_dictionary = request.files
    pdf_filenames = pdf_dictionary.keys()
    for filename in pdf_filenames:
        pdf_object = pdf_dictionary[filename]
        pdf_object.save('/tmp/' + filename)
        storePDFInAzure('/tmp/' + filename, filename, user_id)

    return make_response()

def storePDFInAzure(local_path_to_file, filename, user_id):
    print('Uploading ' + filename)
    BLOCK_BLOB_SERVICE.create_blob_from_path(
        container_name='filezone-static',
        blob_name='pdf/' + user_id + '/' + filename,
        file_path=local_path_to_file,
        content_settings=ContentSettings(content_type='application/pdf')
    )
    print('Successfully uploaded ' + filename)

@app.route('/delete', methods=['POST'])
def delete():
    filename = json.loads(request.data.decode('utf-8'))['userID']
    user_id = request.headers['userid']
    removePDFFromAzure(filename, user_id)

    return make_response()

def removePDFFromAzure(filename, user_id):
    print('Deleting ' + filename)
    BLOCK_BLOB_SERVICE.delete_blob(
        container_name='filezone-static',
        blob_name='pdf/' + user_id + '/' + filename
    )
    print('Successfully deleted ' + filename)

if __name__ == '__main__':
    # app.run(debug=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

