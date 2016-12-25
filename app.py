from __future__ import print_function
from flask import Flask, render_template, request, redirect, make_response, Response
from azure.storage.blob import BlockBlobService, ContentSettings
import os
import json
import re
import requests
import sys
import urllib.parse

app = Flask(__name__)

BLOCK_BLOB_SERVICE = BlockBlobService(
    account_name='filezone',
    account_key=os.environ['AZURE_FILEZONE_KEY']
)

@app.route('/')
def serve_index():
    return render_template('login.html')

@app.route('/app')
def serve_app():
    return render_template('app.html')  

@app.route('/upload', methods=['POST'])
def upload():
    """
    Uploads files received to Azure inside the folder

    e.g of incoming JSON object 

    POST https://filezone.herokuapp.com/upload
    Content-Disposition: attachment
    UserID: dfe31a9d-bf44-463f-8991-c2edffe349f0

    --- (content of attached files goes here) ---
    """
    user_id = request.headers['userid']
    pdf_dictionary = request.files
    pdf_filenames = pdf_dictionary.keys()
    for filename in pdf_filenames:
        pdf_object = pdf_dictionary[filename]
        pdf_object.save('/tmp/' + filename)
        store_PDF_in_azure(local_path_to_file='/tmp/' + filename, 
                           filename=filename, 
                           user_id=user_id)

    return Response(response={}, 
                    status=200, 
                    mimetype='application/json')

def store_PDF_in_azure(local_path_to_file, filename, user_id):
    """
    Uploads a file to Azure
    Args:
    local_path_to_file: local path to file to be uploaded
    filename: desired name of file on Azure once uploaded
    user_id: specifies folder file should be uploaded to
    """
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
    """
    Deletes a file from Azure

    e.g of incoming JSON object 

    POST https://filezone.herokuapp.com/delete
    Content-Type: application/json
    UserID: dfe31a9d-bf44-463f-8991-c2edffe349f0

    {
        'filename': 'filezone.pdf'
    }

    filename: name of file to be deletedå
    """
    filename = json.loads(request.data.decode('utf-8'))['filename']
    user_id = request.headers['userid']
    remove_PDF_from_azure(filename, user_id)

    return Response(response={}, 
                    status=200, 
                    mimetype='application/json')

def remove_PDF_from_azure(filename, user_id):
    """
    Deletes a file from Azure
    Args:
    filename: name of file to be deleted
    user_id: name of folder where file can be found
    """
    print('Deleting ' + filename)
    BLOCK_BLOB_SERVICE.delete_blob(
        container_name='filezone-static',
        blob_name='pdf/' + user_id + '/' + filename
    )
    print('Successfully deleted ' + filename)


@app.route('/rename_duplicates', methods=['POST'])
def rename_duplicates():
    """
    Given an array of filenames already in the user's 
    Azure folder, and an array of filenames that the user
    wants to add to his/her folder, resolves naming collisions
    by appending the suffix ([NUMBER]) after the original name
    and before the extension (e.g file.pdf -> file(1).pdf; file(2).pdf -> file(3).pdf)
    such that no PDF will be rejected for upload AND each PDF has a 
    unique filename. Returns a single array of unique filenames 
    for both files already in and to be uploaded to Azure.

    e.g of incoming JSON object 

    POST https://filezone.herokuapp.com/rename_duplicates
    Content-Type: application/json

    {
        'filesData':  [
                         {
                             'name': 'filezone.pdf',
                             'size': '0.05'
                         }
                      ],
        'newFilesData': [   
                            {
                                'name': 'filezone2.pdf',
                                'size': '1.34' 
                            }
                        ]
    }    

    filesData: an array of filenames already in the user's 
    Azure folder

    newFilesData: an array of filenames that the user
    wants to add to his/her folder

    e.g of response JSON object

    {
        'filesData':  [
                         {
                             'name': 'filezone3.pdf',
                             'size': '0.49'
                         }
                      ]
    }    

    filesData: A single array of unique filenames for all 
    files - including files already in Azure and files to be uploaded
    """
    file_data_list = (request.get_json())['filesData']
    new_file_data_list = (request.get_json())['newFilesData']

    for file_data in new_file_data_list:
        filename_list = [file_data['name'] for file_data in file_data_list]
        renamed_file_data = {
            'name': get_unique_name(file_data['name'], filename_list),
            'size': file_data['size']
        }
        file_data_list.append(renamed_file_data)

    return Response(response=json.dumps({'filesData': file_data_list}), 
                    status=200, 
                    mimetype='application/json')

def get_unique_name(filename, filename_list):
    """
    Return a unique filename such that the filename
    has not yet been taken in filename_list
    Args:
        filename: filename is changed if existing file in filename_list;
        no change other
        filename_list: list of files the filename arg must not match
    Returns a unique filename
    """
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

@app.route('/download_from_dropbox_and_store', methods=['POST'])
def download_from_dropbox_and_store():
    """
    Downloads all files from URLs specified, saves them 
    temporarily and uploads them to Azure with names speicfied
    in the filenames list

    e.g of incoming JSON object 

    POST https://filezone.herokuapp.com/download_from_dropbox_and_store
    Content-Type: application/json
    UserID: dfe31a9d-bf44-463f-8991-c2edffe349f0

    {
        'fileUrlList':  ['dl.dropboxcontent.com/s/vu5dz/filezone.pdf',
                         'dl.dropboxcontent.com/s/vu5dz/filezone2.pdf'],
        'newFilesData': ['filezone.pdf', 'filezone2.pdf']
    }   
    'dl.dropboxcontent.com/s/vuziu2wsa6mp5dz/filezone.pdf'

    fileUrlList: array of URLs to PDFs stored on a Dropbox account
    that are to be downloaded

    filenameList: array of names that the files downloaded off
    Dropbox should be saved as on Azure (file name provided may
    not be equivalent to current name on Dropbox due to collisions)
    """
    print('before file_url_list')
    file_url_list = (request.get_json())['fileUrlList']
    print(file_url_list)

    print('before filename_list')
    filename_list = (request.get_json())['filenameList']
    print(filename_list)

    print('before user_id')
    user_id = request.headers['userID']
    print(user_id)

    for index, file_url in enumerate(file_url_list):
        print('before local_file_path')
        local_file_path = download_file(file_url)
        print('before store pdf in azure')
        store_PDF_in_azure(local_path_to_file=local_file_path, 
                           filename=filename_list[index],
                           user_id=user_id)

    return Response(response={}, 
                    status=200, 
                    mimetype='application/json')

def download_file(url):
    """
    Downloads file from Dropbox URL in chunks and
    saves file onto temporary folder on local/Heroku filesystem
    """
    local_file_path = '/tmp/' + url.split('/')[-1]
    r = requests.get(url, stream=True)
    with open(local_file_path, 'wb') as f:
        for chunk in r.iter_content(chunk_size=1024): 
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)
    return local_file_path

@app.route('/get_user_filenames', methods=['POST'])
def get_user_filenames():
    """
    Return a list of names for all files currently stored 
    in the user's account

    e.g of incoming JSON object 

    POST https://filezone.herokuapp.com/get_user_filenames
    Content-Type: application/json
    UserID: dfe31a9d-bf44-463f-8991-c2edffe349f0

    { /* empty */ }

    e.g of response JSON object 

    {
        'filesData':  [
                         {
                             'name': 'filezone3.pdf',
                             'size': '0.49'
                         }
                      ]
    }    

    """
    user_path = 'pdf/' + request.headers['userid']
    blob_list = BLOCK_BLOB_SERVICE.list_blobs('filezone-static',
                                              prefix=user_path)

    files_data_list = []
    for blob in blob_list:
        filename = (blob.name.split(user_path + '/'))[1]
        size = round(blob.properties.content_length / 1000000, 2)

        files_data_list.append({'name': filename, 'size': size})

    return Response(response=json.dumps({'filesData': files_data_list}), 
                    status=200, 
                    mimetype='application/json')

if __name__ == '__main__':
    # app.run(debug=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

