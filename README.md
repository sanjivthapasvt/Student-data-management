The project is on its initial and development phase so any kind of help would be much appreciated. Be it
may testing, reporting issues, helping us code, etc

To contribute to this repository,

```bash
#Fork this repository

#Clone the repository you forked
git clone https://github.com/.......git

#Let's start by getting your backend ready
#Change directory to backend
cd Student-data-management/backend

#Create virtual env for python

python -m venv venv

#Activate venv on linux/unix

source venv/bin/activate

#Activate venv on windws

venv\Scripts\activate

#install required dependencies

pip install -r requirements.txt

#Now change directory to student_data_mgmt to migrate and make migrations

cd student_data_mgmt

#finally run migrations

python manage.py makemigrations api

python manage.py migrate

#Keep backend running in background other wise it will not work

#Now fireup another terminal window

# Change directory to the frontend instead of backend this time

cd frontend

# Run npm install to install necessary dependencies

npm install

#Run and check if it is running

npm start

#Now everything should work edit the code and send pull request we will review it and accept it 

```

To get started or test follow these steps:
```bash
#Clone this repository

git clone https://github.com/bitgurkhas/Student-data-management.git 

# Change directory to backend and create virtual env and activate it:
cd Student-data-management/backend

python -m venv venv

#Activate venv on linux/unix
source venv/bin/activate

#Activate venv on windws
venv\Scripts\activate

#install required dependencies
pip install -r requirements.txt

#now finally change directory and make migrations and runserver
cd student_data_mgmt
python manage.py makemigrations api
python manage.py migrate
python manage.py runserver

#fire up another terminal window without killing previous

#Change directory to frontend
cd Student-data-management/frontend

# Run npm install to install necessary dependencies
npm install

#Run and you should be good to go
npm start
```
