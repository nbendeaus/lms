import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import { User } from '../models/user';
import { LoginComponent } from '../login/login.component';
import { EventService } from '../services/event.service';
import { StudentService } from '../services/student.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() changeCalendar = new EventEmitter<Object>();
  user: User;
  navbarUsername: string;
  newCalendarTitle: string;
  listOfCalendarsAsObject;
  arrayOfCalendars = [];
  isAdmin: boolean;
  thisSaved;


  // The contructor function runs automatically on component load, each and every time it's called
  constructor(
    private router: Router,
    private afa: AngularFireAuth,
    private afd: AngularFireDatabase,
    private es: EventService,
    private serviceStudent: StudentService
  ) {
    // pulls current user out of the local storage to show in navbar
    this.navbarUsername = localStorage.getItem('navbarUsername');
    // query database to obtain list of calendars to populate dropdown menu with
    const thisSaved = this;
    this.afd.database.ref('/calendars').once('value').then(function (listOfCalendarsFromDB) {
      thisSaved.listOfCalendarsAsObject = listOfCalendarsFromDB.val();
      // iterate over object and turn it into an array of calendars
      Object.keys(thisSaved.listOfCalendarsAsObject).forEach(function (key) {
        thisSaved.arrayOfCalendars.push(thisSaved.listOfCalendarsAsObject[key]);
      });
      // Now that we have our array full of calendars, let's see which ones they are allowed to see.
      // Check if they are on the isAdmin table
      thisSaved.afd.database.ref('/isAdmin').once('value').then(function (isAdminTable) {
        const objectOfAdmins = isAdminTable.val();
        const authData = thisSaved.afa.auth.currentUser.email;
        const atSign = authData.search('@');
        const userToCheckIfAdmin = authData.slice(0, atSign);
        thisSaved.isAdmin = objectOfAdmins.hasOwnProperty(userToCheckIfAdmin);  // isAdmin is boolean true/false
        thisSaved.serviceStudent.isAdmin = thisSaved.isAdmin;
        // If they are an admin, do nothing
        // Otherwise, query the 'student' table, which returns object full of calendar names they are authorized to view
        // Iterate over thisSaved.arrayOfCalendars, and any calender that doesn't have it's name on the list, erase
        if (!thisSaved.isAdmin) {
          // console.log('You aren\'t an admin, so we need to find out which calendars you are allowed to view!');
          thisSaved.afd.database.ref('/students').once('value').then(function (studentsTable) {
            const objectOfStudents = studentsTable.val();
            // console.log('The calendars you are authorized to view are:');
            // console.log(objectOfStudents[thisSaved.navbarUsername]);
            for (let i = 0; i < thisSaved.arrayOfCalendars.length; i++) {
              const iteratingCalendarTitle = thisSaved.arrayOfCalendars[i]['title'];
              if (objectOfStudents[thisSaved.navbarUsername].hasOwnProperty(iteratingCalendarTitle)) {
                // Do nothing
              } else {
                // Then the current user doesn't have this calendar added, so we need to erase this calendar from the array, set to null
                thisSaved.arrayOfCalendars[i] = null;
              }
            }
            // Loop over array and erase all null values
            thisSaved.arrayOfCalendars = thisSaved.arrayOfCalendars.filter(function(n){ return n !== null; });
          });
        }
      });
    });

  } // End of constructor


  // query the database for the calendar with a given name
  // set whole calendar to value in service
  // fires event that tells calendar component to load new calendar
  selectCalender(event) {
    const thisSaved = this;
    this.afd.database.ref('/calendars/' + event.target.innerText).once('value').then(function (selectedCalender) {
      thisSaved.es.currentCalender = selectedCalender.val();
      thisSaved.changeCalendar.emit(null);
    });
  }


  createNewCalendar() {
    // pulls current user out, sets as the creator for this calendar
    const creatorWithAtSign = this.afa.auth.currentUser.email;
    const atSign = creatorWithAtSign.search('@');
    const creator = creatorWithAtSign.slice(0, atSign);
    // create the calendar in the database, populated with the title and creator
    this.afd.database.ref('/calendars/' + this.newCalendarTitle).set({
      title: this.newCalendarTitle,
      creator: creator
    });
    // query database for all calendars, so the dropdown menu will populate with this new calendar
    // iterate over the object and turn it into an array
    const thisSaved = this;
    this.afd.database.ref('/calendars').once('value').then(function (listOfCalendarsFromDB) {
      thisSaved.listOfCalendarsAsObject = listOfCalendarsFromDB.val();
      let counterOfCalendars = 0;
      Object.keys(thisSaved.listOfCalendarsAsObject).forEach(function (key) {
        thisSaved.arrayOfCalendars[counterOfCalendars] = thisSaved.listOfCalendarsAsObject[key];
        counterOfCalendars++;
      });
    });
  }

// signs user out by clearing the local storage, navigate back to home page (login)
  signout() {
    localStorage.clear();
    this.router.navigateByUrl('/');
  }



} // End of component
