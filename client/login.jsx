import { sendPost } from "./helpers.js";
import reactDOM from "react-dom";
import React, { useState } from "react";

/**
 * This function handles logging in for the domo 
 * @param {*} e 
 * @returns 
 */
const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();
    //Get username and password from form and see if they're valid.
    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    if (!username || !pass) {
        helper.handleError('Username or password is empty.');
        return false;
    }
    //Send post request with data.
    helper.sendPost(e.target.action, { username, pass });
    return false;
};
/**
 * This function handles the sign up process for the domo maker.
 * @param {*} e 
 * @returns 
 */
const handleRegistration = (e) => {
    e.preventDefault();
    helper.hideError();
    //Get username and password from form and see if they're valid.
    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const premium = e.target.querySelector('#premium').checked;
    //Make sure all fields are filled in.
    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required.');
        return false;
    }
    //Make sure passwords match.
    if (pass !== pass2) {
        helper.handleError('Passwords do not match.');
        return false;
    }
    //Send post request with data.
    helper.sendPost(e.target.action, { username, pass, pass2, premium });
    return false;
};
/**
 * This function creates the login form for the domo maker.
 * @returns 
 */
const LoginWindow = () => {
    //Add Sign Up button at bottom.
    return (
        <div className="formWindow">

            <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
                <h1>Sign In</h1>
                <input id="user" type="text" name="username" placeholder="Username" />
                <input id="pass" type="password" name="pass" placeholder="Password" />
                <input className="formSubmit" type="submit" value="Sign In" />
                <h3 className = "warning hidden"><span className = "errorMessage"></span></h3>
            </form>           
            <div id="signUp">
                New to Netflix? <a id="signupButton" href="/signup" onClick={(e) => {
                    e.preventDefault();
                    ReactDOM.render(<RegistrationWindow />, document.querySelector('#content'));
                }}><strong>Sign up now</strong>.</a>
            </div>
        </div>
    );
};
/**
 * This function creates the signup form for the domo maker.
 * @returns 
 */
const RegistrationWindow = () => {
    //Add Sign In button at bottom.
    return (
        <div className="formWindow">
            <form id="signupForm" onSubmit={handleRegistration} action="/signup" method="POST" className='mainForm'>
                <h1>Sign Up</h1>
                <label htmlFor='username'>Username: </label>
                <input id="user" type="text" name="username" placeholder="Username" />
                <label htmlFor="pass">Password: </label>
                <input id="pass" type="password" name="pass" placeholder="Password" />
                <label htmlFor="pass2">Re-enter Password: </label>
                <input id="pass2" type="password" name="pass2" placeholder="Re-enter Password" />
                <label htmlFor="premium">Premium: </label>
                <input id="premium" type="checkbox" />
                <input className="formSubmit" type="submit" value="Sign Up" />
                <h3 className = "warning hidden"><span className = "errorMessage"></span></h3>
            </form>
            <div id="login">
                Already have an account? <a id="loginButton" href="/login" onClick={(e) => { e.preventDefault(); ReactDOM.render(<LoginWindow />, document.querySelector('#content')); }}><strong>Log In</strong></a>
            </div>
        </div>
    );
};


window.onload = () => { ReactDOM.render(<LoginWindow />, document.querySelector('#content')); };