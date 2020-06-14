# Angular-Calendar

- Technical Assignment - a part of Stellic's hiring Process

- Angular Version: https://code.angularjs.org/1.4.0/

## Instruction to Launch

- Start the server via `npm start` while in the server directory.
- Launch `main.html` from the root directory in any modern browser*.

## File Structure

- Server files - `/Server/` (unchanged, as they were originally)
- JavaScript files `/js/`

## Guides Used

- AngularJS Material Demos: https://material.angularjs.org/1.1.22/demo

## Restrictions/Assumptions

- A day can only be booked by a single tennant at a given time.
- There were a few duplicate reservations in the file the backend is serving. For example, `"Marianna Gregory"` appears twice. This has been left as it was.
- Chrome's console gives a passive event listener warning. It's a compatibility issue of modern browsers with AngularJS. Source: https://github.com/angular/angular.js/issues/15901

# *Tested On
- Chrome
- Firefox
- Microsoft Edge.