import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import { FirebaseService } from '../services/auth.service';
import { User } from '../models/user';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public loginErrors = {username: '', pass: ''};  // This one is public so that angular can access it
  public signupErrors = {username: '', pass: ''};  // This one is public so that angular can access it
  loginModel = {username: '', pass: ''};  // Model that angular will store data in
  signupModel = {username: '', pass: ''};  // Model that angular will store data in
  user: User; // User that we will send to the database
  userUsernameLogin: string;  // Just the student10, no @elevenfifty.org
  userUsernameSignup: string;  // Just the student10, no @elevenfifty.org
  usernameToSendLogin: string;  // The username that gets sent to Firebase, includes @elevenfifty.org
  usernameToSendSignup: string;  // The username that gets sent to Firebase, includes @elevenfifty.org
  studentTableArray;



  constructor(public fbs: FirebaseService, public afd: AngularFireDatabase) {
  }



  validateSignup() {
    this.signupErrors = {username: '', pass: ''};
    if (!this.signupModel.username) {
      this.signupErrors.username = 'Please provide an username';
    }
    if (!this.signupModel.pass) {
      this.signupErrors.pass = 'Please provide a password';
    }
    return(this.signupErrors.username || this.signupErrors.pass);  // Returns true if there are errors
  }

  onSignup() {
    if (this.validateSignup()) { // If there are errors, do not submit the form
      return;
    }
    this.userUsernameSignup = this.signupModel.username;
    // Check if this.userUsernameSignup (which is just 'student11' - no @elevenfifty.org) is in the 'students' table in Firebase
    const thisSaved = this;
    this.afd.database.ref('/students').once('value').then(function (studentTableAsObject) {
      const isValidStudent = studentTableAsObject.val().hasOwnProperty(thisSaved.userUsernameSignup);
      if (!isValidStudent) {
        alert('The provided signup information isn\'t authorized to view any calendars, account NOT created!');
      } else {
        console.log('Valid student located in "student" table in Firebase. Allowing signup to proceed...');
        thisSaved.usernameToSendSignup = thisSaved.signupModel.username + '@elevenfifty.org';
        thisSaved.user = new User(thisSaved.usernameToSendSignup, thisSaved.signupModel.pass);
        thisSaved.fbs.signup(thisSaved.user);
        localStorage.setItem('navbarUsername', thisSaved.userUsernameSignup);
      }
    });
  }



  validateLogin() {
    this.loginErrors = {username: '', pass: ''};
    if (!this.loginModel.username) {
      this.loginErrors.username = 'Please provide an username';
    }
    if (!this.loginModel.pass) {
      this.loginErrors.pass = 'Please provide a password';
    }
    return(this.loginErrors.username || this.loginErrors.pass);  // Returns true if there are errors
  }

  onLogin() {
    if (this.validateLogin()) { // If there are errors, do not submit the form
      return;
    }
    this.userUsernameLogin = this.loginModel.username;
    this.usernameToSendLogin = this.loginModel.username + '@elevenfifty.org';
    this.user = new User(this.usernameToSendLogin, this.loginModel.pass);
    this.fbs.login(this.user);
    localStorage.setItem('navbarUsername', this.userUsernameLogin);
  }





} // End of component
