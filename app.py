from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response, Response
from azure.storage.blob import BlockBlobService, ContentSettings
import os
import json
import re
import requests

app = Flask(__name__)

BLOCK_BLOB_SERVICE = BlockBlobService(
    account_name='filezone',
    account_key=os.environ['AZURE_FILEZONE_KEY']
)

@app.route('/')
def hello_world():
    # return render_template('gdrive.html')
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
    # print('Uploading ' + filename)
    BLOCK_BLOB_SERVICE.create_blob_from_path(
        container_name='filezone-static',
        blob_name='pdf/' + user_id + '/' + filename,
        file_path=local_path_to_file,
        content_settings=ContentSettings(content_type='application/pdf')
    )
    # print('Successfully uploaded ' + filename)

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

@app.route('/rename_duplicates', methods=['POST'])
def rename_duplicates():
    file_data_list = (request.get_json())['filesData']
    new_file_data_list = (request.get_json())['newFilesData']

    for file_data in new_file_data_list:
        filename_list = [file_data['name'] for file_data in file_data_list]
        renamed_file_data = {
            'name': get_unique_name(file_data['name'], filename_list),
            'size': file_data['size']
        }
        file_data_list.append(renamed_file_data)

    return Response(response=json.dumps(file_data_list), 
                    status=200, 
                    mimetype='application/json')

def get_unique_name(filename, filename_list):
    while filename in filename_list:
        number_id_substring_list = re.findall(r"\([0-9]+\)\.pdf", filename)
        if number_id_substring_list:
            number_id_substring = number_id_substring_list[0]
            number_id = int((re.findall(r"[0-9]+", number_id_substring))[0])

            name_substring = filename.split(number_id_substring)[0]
            new_number_id_substring = "(" + str(number_id + 1) + ").pdf"
            
            filename = name_substring + new_number_id_substring
        else:
            filename = filename.split('.')[0] + '(1).pdf'

    return filename

@app.route('/download_from_dropbox_and_store', methods=['POST']):
def download_from_dropbox_and_store:
    file_url_list = request.get_json()
    print(file_url_list)

if __name__ == '__main__':
    # app.run(debug=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

