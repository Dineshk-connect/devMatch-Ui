# DevMatch UI – Real-Time Developer Match & Chat Platform (Frontend)

DevMatch UI is the frontend for a real-time developer networking platform where users can match with other developers, chat instantly, and collaborate.  
Built with React and Tailwind CSS, the interface focuses on speed, responsiveness, and a clean developer-centric experience.

---

## ⚙️ Tech Stack
- **React.js**
- **Tailwind CSS**
- **React Router**
- **Axios**
- **Socket.io Client**
- **JWT-based auth integration**

---

## ✨ Features
- **Developer Matching** – Swipe/match style interactions inspired by Tinder but built for developers.  
- **Real-Time Chat** – Instant messaging powered by Socket.io.  
- **User Authentication** – Login & signup UI integrated with backend JWT auth.  
- **Profile Management** – Update developer details, skills, and preferences.  
- **Responsive Layout** – Fully optimized for desktop and mobile.  
- **Clean Component Architecture** – Organized and scalable React structure.

---


## 🔌 Connecting to the Backend
Create a `.env` file
VITE_SERVER_URL=https://your-backend-url


The UI communicates with the backend using Axios + Socket.io client.

---

## 🚀 Running the Project

```bash
npm install
npm run dev
The app will start on:
http://localhost:5173



# DevMatch Development Phases(Learning purpose)

Day -01

Session -01

- Created a Vite + React application
- Remove uneccessary code and create a Hello World app
- Install Tailwind CSS
- Install Daisy UI
- Add NavBar Component to App.jsx
- Create a NavBar.jsx separate component file
- Install react router dom
- Create BrowserRouter > Routes > Route=/ Body > RouteChildren
- Create an Outlet in Body Component
- craate a Footer Component


Session -02

- Create a Login Page
- Install axios
- CORS - install cors in backend => add middleware to with configuration: origin, crendenntials: true
- Whenever you're making API call to pass axios => { withcrendentilas: true} 
- Install Redux Toolkit
- => configureStore => Provider => createSlice => add reducer to store
- Add redux devtools in chrome
- Login and see if your data is coming properly in the store
- NavBar should update as soon as user logs in
- Refactor our code to add constants file + Create a component folder

Session -03

- You should not able to access other routes without login
- If token is not present redirect user to login page
- Logout
- profile Page
- Get the feed and the feed in the store
- Build the user card on the feed


Session -04

- Edit profile feature
- Show Toast Message on save of profile
- New page - See all my connections
- New page - see all my Connections Requests

Session -05

- Feature - Accept/Reject Connection Request
- Send/Ignore the user card from the feed



# Razorpay Payment Gateway Integration
    - Sign up on Razorpay & complete KYC
    - Created a UI for premium page
    - Creating an API for create order in backend
    - added key and secret in env file
    - Intialized Razorpay in utils
    - creating order on Razorpay
    - create Schema and model
    - saved the order in payment collection
    - make the API dynamic 


