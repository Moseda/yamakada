import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import EmailVerification from './Verification/EmailVerification';
//import NotFoundError from './Components/errors/error404';
import ProtectedRoute from './Components/ProtectedRoute';


//React router dom
import{
  createBrowserRouter,
  RouterProvider,
}from 'react-router-dom'

const router = createBrowserRouter([  
    {
      path: '/',
      element: <div><Login /></div>
    },

    {
      path: '/register',
      element: <div><Register /></div>
    },

    {
      path: '/dashboard',
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>
    },
    {
      path: "/verify/:token",
      element: <div><EmailVerification /></div>
    }
])
function App() {
  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
