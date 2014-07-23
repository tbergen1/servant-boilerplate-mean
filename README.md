# Servant Boilerplate: MEAN Stack

A Servant Boilerplate Application already integrated with Servant built on the MEAN (MongoDB, Express, Angular, Node) stack.  You can rapidly build Servant applications by starting with this boilerplate application.

## Features:

* **Lean MEAN Stack:** There is very little bloat in this version of the MEAN stack.
* **User Management:** User Authentication via Servant is already built and ready to use.  Authentication libraries like Passport are not needed!
* **Single Page Application:** Architected to be an easy-to-use Single Plage Application.
* **Database Not Necessary:** A MongoDB database is set-up, but since this is a Servant app, you may only need to rely on cookies to store minimal amounts of data.
* **Production Optimizations:** Minifies javascript files for use in production and more.


## Installation & Set-Up:

### Database or Session Storage?

Servant hosts most of the User's data for you, so a database may not be required.  However, this app is ready to be used with or without a database.  

##### How To Tell If You Need To Use A Database...

* If you need to store additional data types that Servant does not work with, or expand upon the Data Archetypes, then we recommend using a database, and the application is set up to use MongoDB.  

* If you are planning on only modifying and displaying data hosted on Users' Servants, then we recommend not using a database.

##### Setting Up Session Storage

This is the fastest way to get up and running.  The app is set up so that it will store the User's *User ID, Access Token & Client Token* from their Servant account in cookies.

Please note that we highly recommend getting an SSL certificate if you go this route.