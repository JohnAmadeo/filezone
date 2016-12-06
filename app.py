from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def hello_world():
  return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
  payload = request.get_data()
  print(payload)

  return ''

if __name__ == '__main__':
  app.run(debug=True)

