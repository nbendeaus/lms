import { Component, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import { EventFormComponent } from '../event-form/event-form.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ClassCalendarComponent } from '../class-calendar/class-calendar.component';
import { StudentManagementComponent } from '../student-management/student-management.component';
import { EventService } from '../services/event.service';
import { StudentService } from '../services/student.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  @ViewChild('classCalendar') calendar: ClassCalendarComponent;  // Access properties and methods of the child calendar component
  @ViewChild('eventForm') eventForm: EventFormComponent;  // Access properties and methods of the child eventForm component
  @ViewChild('studentManagement') studentManagement: StudentManagementComponent;
  hideShowEvent = 'showThis';
  hideShowStudent = 'hideThis';

  // The contructor function runs automatically on component load, each and every time it's called
  constructor(public router: Router, public afd: AngularFireDatabase, public afa: AngularFireAuth, public es: EventService) {
    // See if the user is even logged in first, if not, direct them to login screen
    // if (this.afa.auth.currentUser.email === null || this.afa.auth.currentUser.email === undefined) {
    //   this.router.navigateByUrl('/');
    // }
    // console.log('this.afa.auth.currentUser.email is:');
    // console.log(this.afa.auth.currentUser.email);
    // Immediately query the isAdmin table on Firebase to check if the user is authorized to access this route.
    const thisSaved = this;
    this.afd.database.ref('/isAdmin').once('value').then(function (isAdminTable) {
      const arrayOfAdmins = isAdminTable.val();  // Object full of white-listed admins from the database
      const authData = thisSaved.afa.auth.currentUser.email; // Pulls authentication info from the client to identify the current user
      const atSign = authData.search('@');  // Finds @ in current user
      const userToCheckIfAdmin = authData.slice(0, atSign); // Strips out @ and everything past that fro the current user
      // If our database object full of admins has a property of this username then set variable isAdmin to true
      const isAdmin = arrayOfAdmins.hasOwnProperty(userToCheckIfAdmin);
      // If isAdmin is false (the user isn't a white-listed admin) then re-route to /student
      if (!isAdmin) {
        thisSaved.router.navigateByUrl('/student');
      }
    });
  }



  // Handles which verison of the form sent an action, if the event is being triggered by clicking the add vs delete vs edit button
  addOrEditEvents(operation) {
    // Operation is the string that holds which action to be performed
    if (operation === 'add') {
      this.calendar.renderEvents();
    } else if (operation === 'delete') {
      this.calendar.deleteEvents();
    } else {
      this.calendar.updateEvents();
    }
  }



  // This is called when a calendar is selected from the dropdown
  loadEvents() {
    // If the Edit Event form is currently shown, reset it
    if (this.eventForm !== undefined) {
      this.eventForm.arrayOfGoodStudents = [];
      this.eventForm.arrayOfBadStudents = [];
      this.eventForm.showEdit = false;
      this.eventForm.currentForm = 'Add';
      this.eventForm.eventDate = '';
      this.eventForm.eventName = '';
      this.eventForm.eventType = 'Event Type';
      this.eventForm.eventLink = '';
    }
    // If the Add Student form is currently shown, reset it
    if (this.studentManagement !== undefined) {
      this.studentManagement.newStudentUsername = '';
    }
    this.es.eventArray = [];  // Clears events array
    const thisSaved = this;
    let counterOfEvents = 0;
    // Make sure there are events for the selected calendar - stops errors when loading an empty calendar
    if (thisSaved.es.currentCalender.events !== undefined) {
      // Iterate through events object inside currentCalendar and turns the return object into an array of objects
      Object.keys(thisSaved.es.currentCalender.events).forEach(function (key) {
        thisSaved.es.eventArray[counterOfEvents] = thisSaved.es.currentCalender.events[key];
        thisSaved.es.eventArray[counterOfEvents].id = key;  // Overwrite the id in each event with the key generated by Firebase
        counterOfEvents++;
      });
    }
    // Now that we've loaded our events, actually load the calendar
    this.calendar.loadCalendar();
    if (this.studentManagement !== undefined) {
      this.studentManagement.getStudents();
    }
  }



  // When the buttons (fake tabs) are clicked, update variables to switch between Student Management and Event Management
  showEventForm() {
    this.hideShowEvent = 'showThis';
    this.hideShowStudent = 'hideThis';
  }
  showStudentForm() {
    this.hideShowStudent = 'showThis';
    this.hideShowEvent = 'hideThis';
  }



  // Alerts the event-form component that an event was clicked and sends that event's data
  alertEventForm(data) {
    this.showEventForm();
    this.eventForm.editEvent(data);
  }



} // End of component
