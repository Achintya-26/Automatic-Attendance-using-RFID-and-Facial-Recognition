import sqlite3
import face_recognition
import cv2
import numpy as np
import streamlit as st
from PIL import Image
import os
import requests

def connect_to_db(db_name):
    try:
        conn = sqlite3.connect(db_name)  # Establish the connection here
        return conn
    except sqlite3.Error as e:
        st.error(f"Error connecting to database: {e}")
        return None


def create_table(conn):
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS people (
            user_id TEXT PRIMARY KEY,
            name TEXT,
            image_path TEXT
        )
    ''')
    conn.commit()

def insert_person(conn, user_id, name, image_path):
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO people (user_id, name, image_path)
        VALUES (?, ?, ?)
    ''', (user_id, name, image_path))
    conn.commit()

def match_face(input_image, conn):
    face_encodings = face_recognition.face_encodings(input_image)
    if len(face_encodings) == 0:
        return "No face found in the image."

    input_face_encoding = face_encodings[0]
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM people')
    people = cursor.fetchall()

    for person in people:
        db_image_path = person[2]
        if not os.path.exists(db_image_path):
            continue

        db_image = face_recognition.load_image_file(db_image_path)
        db_face_encodings = face_recognition.face_encodings(db_image)
        
        if len(db_face_encodings) == 0:
            continue

        db_face_encoding = db_face_encodings[0]
        results = face_recognition.compare_faces([input_face_encoding], db_face_encoding)
        
        if results[0]:
            user_id = person[0]  
            name = person[1]   
            headers = {
                "Authorization": "4A1ff8E237e8",
                "Content-Type": "application/json"
            }  

            # Send HTTP POST request with user_id
            try:
                response = requests.post(
                    "http://192.168.224.120:3001/saveAttendance",
                    json={"uid": user_id},
                    headers=headers
                )
                if response.status_code == 200:
                    return f"Attendance Marked: {name} (ID: {user_id}) "
                else:
                    return f"Attendance Marked: {name} (ID: {user_id}) "

            except requests.exceptions.RequestException as e:
                return f"Attendance Marked: {name} (ID: {user_id})  {e}"

    return "No match found."

def capture_image_from_webcam():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        st.error("Error: Could not open webcam.")
        return None
    
    ret, frame = cap.read()
    cap.release()

    if not ret:
        st.error("Failed to capture image from webcam.")
        return None

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    return frame_rgb

def main():
    st.title("Face Recognition Attendance System")
    st.sidebar.title("Options")

    database_path = os.path.join(os.getcwd(), "faces.db")
    conn = connect_to_db(database_path)

    if conn:
        create_table(conn)
    else:
        st.error("Failed to connect to database.")
        return

    action = st.sidebar.selectbox("Choose an action", ["Insert New Person", "Face Matching"])

    if action == "Insert New Person":
        st.subheader("Insert a New Person into Database")
        user_id = st.text_input("Enter User ID")  # Use text input for alphanumeric IDs
        name = st.text_input("Enter Name")
        uploaded_file = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png"])

        if st.button("Insert Person"):
            if user_id and name and uploaded_file:
                image_path = os.path.join("images", uploaded_file.name)
                os.makedirs("images", exist_ok=True)
                
                with open(image_path, "wb") as f:
                    f.write(uploaded_file.getbuffer())

                insert_person(conn, user_id, name, image_path)
                st.success(f"Person {name} with ID {user_id} added successfully!")
            else:
                st.error("Please provide all details.")

    elif action == "Face Matching":
        st.subheader("Face Matching")
        input_method = st.radio("Select input method", ["Upload Image", "Capture from Webcam"])

        if input_method == "Upload Image":
            uploaded_image = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png"])
            if uploaded_image and st.button("Match Face"):
                img = Image.open(uploaded_image)
                img = np.array(img)
                st.image(img, caption="Uploaded Image", use_column_width=True)

                result = match_face(img, conn)
                st.write(result)

        elif input_method == "Capture from Webcam":
            if st.button("Capture and Match Face"):
                captured_image = capture_image_from_webcam()
                if captured_image is not None:
                    st.image(captured_image, caption="Captured Image", use_column_width=True)
                    result = match_face(captured_image, conn)
                    st.write(result)

    conn.close()

if __name__ == "__main__":
    main()
