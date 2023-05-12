from flask import Flask, render_template, request
import json

app = Flask(__name__)
print(__name__)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/home.html')
def adminhomepage():
	return render_template('home.html')

@app.route('/about.html')
def readmepage():
	return render_template('about.html')

@app.route('/studentdatabase.html')
def studentdbpage():
	return render_template('studentdatabase.html')


