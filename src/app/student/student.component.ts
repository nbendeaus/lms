import { Component, ViewChild, Output } from '@angular/core';
import { ClassCalendarComponent } from '../class-calendar/class-calendar.component';
import { EventService } from '../services/event.service';


@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent {
  @ViewChild('classCalendar') calendar: ClassCalendarComponent;
    // The contructor function runs automatically on component load, each and every time it's called
  constructor(public events: EventService) {}

   loadEvents() {
     // This is called when a calendar is selected from the dropdown
    this.events.eventArray = []; // Clears events array
    console.log('loadEvents in studentComponent Called');
    console.log(this.events.currentCalender);
    const thisSaved = this;
    let counterOfEvents = 0;
    console.log(thisSaved.events.currentCalender.events);
    if (thisSaved.events.currentCalender.events !== undefined) { // checks if the calendar has existing events
      Object.keys(thisSaved.events.currentCalender.events).forEach(function (key) {
        thisSaved.events.eventArray[counterOfEvents] = thisSaved.events.currentCalender.events[key];
        thisSaved.events.eventArray[counterOfEvents].id = key;
        counterOfEvents++;
      });
    }
    this.calendar.loadCalendar(); // call calendar load
  }
}
