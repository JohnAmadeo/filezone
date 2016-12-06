from flask import Flask, render_template, request, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    payload = request.get_data()
    print(payload)
    return ''

@app.route('/hw1.pdf')
def hostpdf():
    # print(os.getcwd() + '/thegame.jpg')
    return send_from_directory(os.getcwd(), 'hw1.pdf')

if __name__ == '__main__':
    app.run(debug=True)

