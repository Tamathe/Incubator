from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/media')
def media():
    return render_template('media.html')

@app.route('/publications')
def publications():
    return render_template('publications.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/join')
def join():
    return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)
