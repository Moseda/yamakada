import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import video from '../../LoginAssets/video.mp4';
import MimucoLogo from '../../LoginAssets/MimucoLogo.png';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import { IoKey } from "react-icons/io5";
import Axios from 'axios';


const Register = () => {
    //UseState for holding input
    const[email, setEmail] = useState('');
    const[username, setUsername] = useState('');
    const[password, setPassword] = useState(''); 
    const navigateTo = useNavigate()


    const [registerStatus, setRegisterStatus] = useState('');
    const [passwordError, setPasswordError] = useState('');


    //password regex
    const validatePassword = (password) => {
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain a number';
        return '';
      };


    //for the onClick to get what the user typed
    const createUser = (e)=>{
        
        e.preventDefault(e)

        //clear precedent errors
        setPasswordError('')
        setRegisterStatus('')
        
        // validate password
        const passwordError = validatePassword(password);
        if (passwordError) {
            setPasswordError(passwordError);
            return;
        }
            
        const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
        if (password !== confirmPasswordInput.value) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (!email || !username || !password) {
            setRegisterStatus('All fields are required');
            return;
        }

        //API request with axios
        Axios.post('http://localhost:3002/register',{
            //variables to send to the server
            Email: email,
            Username: username,
            Password: password
        }).then(()=>{                
                setRegisterStatus('Registration successful!');
                //and clear field
                setEmail('')
                setUsername('')
                setPassword('')
                setTimeout(() => navigateTo('/'), 2000); //just to check the message displayed

                // working redirect but sketchy
                {/*if (response.data.message === 'User added') {
                    // Navigate to login page after successful registration
                    setRegisterStatus('Registration successful! Redirecting...');
                    setTimeout(() => window.location.href = '/', 2000);
                }*/}
        }).catch((error) => {
            setRegisterStatus(error.response?.data?.message || 'Registration failed');
        });
    }
  return (
    <div className="d-flex vh-100">
      <div className="container-fluid d-flex">
        {/* Left Section: Video and Text */}
        <div className="col-md-6 position-relative">
          <video
            src={video}
            autoPlay
            muted
            loop
            className="w-100 h-100 object-fit-cover"
          ></video>
          <div className="position-absolute top-50 start-50 translate-middle text-white text-center">
            <h2 className="fw-bold mb-3">
              Registrieren Sie sich für nahtlose Datensynchronisation und -verteilung.
            </h2>
            <p>Optimieren Sie Ihre Datenmanagement-Prozesse</p>
          </div>
          <div className="position-absolute bottom-0 start-50 translate-middle-x text-white text-center mb-3">
            <span>Bereits ein Konto?</span>
            <Link to={'/'} className="btn btn-primary ms-2">Anmelden</Link>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-light">
          {/* Header */}
          <div className="text-center mb-4">
            <img src={MimucoLogo} alt="Logo" className="mb-3" style={{ width: '150px' }} />
            <h3>Erstellen Sie Ihr Konto</h3>
          </div>

          {/* Form */}
          <form className="w-75">
            <span className={`alert ${registerStatus.includes('successful') ? 'alert-success' : 'alert-danger'} ${registerStatus ? 'd-block' : 'd-none'} mb-3`}>
            {registerStatus}
            </span>

            {/* Username Input */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Benutzername</label>
              <div className="input-group">
                <span className="input-group-text"><FaUser /></span>
                <input
                  type="text"
                  id="username"
                  placeholder="Benutzername eingeben"
                  className="form-control"
                  onChange={(event)=>{
                    setUsername(event.target.value)
                  }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-Mail</label>
              <div className="input-group">
                <span className="input-group-text"><FaEnvelope /></span>
                <input
                  type="email"
                  id="email"
                  placeholder="E-Mail eingeben"
                  className="form-control"
                  onChange={(event)=>{
                    setEmail(event.target.value)
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Passwort</label>
              <div className="input-group">
                <span className="input-group-text"><IoKey /></span>
                <input
                  type="password"
                  id="password"
                  placeholder="Passwort eingeben"
                  className="form-control"
                  onChange={(event)=>{
                    setPassword(event.target.value)
                  }}
                />
              </div>
              {passwordError && (
                <div className="text-danger mt-1">
                {passwordError}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Passwort bestätigen</label>
              <div className="input-group">
                <span className="input-group-text"><IoKey /></span>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Passwort bestätigen"
                  className="form-control"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100" onClick={createUser}>Registrieren</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
