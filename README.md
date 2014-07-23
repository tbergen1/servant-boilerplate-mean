# Servant Boilerplate: MEAN Stack

A Servant Boilerplate Application already integrated with Servant built on the MEAN (MongoDB, Express, Angular, Node) stack.  Use this to rapidly build Servant applications by starting with this boilerplate application.  We do!

## Features:

* **Lean MEAN Stack:** There is very little bloat in this version of the MEAN stack.
* **User Management:** User Authentication via Servant is already built and ready to use.  Authentication libraries like Passport are not needed!
* **Single Page Application:** Architected to be a Single Page Application.
* **Database Not Necessary:** A MongoDB database is set-up, but since this is a Servant app, you may only need cookies to store minimal amounts of data.
* **Production Optimizations:** Minifies javascript files for use in production and more.
* **Servant Visual Elements:** Servant graphics, colors & fonts included for matching Servant's visual style


## Installation & Set-Up:

### Part 1 – Register Your Application:

Go to http://www.servant.co and register your application in the dashboard.  

Enter this Redirect URL: *http://localhost:8080/auth/servant/callback*

### Part 2 – Database or Session Storage:

Servant hosts most User Data for you, so a database may not be required.  However, this app is ready to be used with or without a database.  

##### How To Tell If You Need To Use A Database...

* If you need to store additional data types that Servant does not work with, or expand upon the Data Archetypes, then we recommend using a database, and the application is set up to use MongoDB.  

* If you are planning on only modifying and displaying data hosted on Users' Servants, then we recommend not using a database.

##### Setting Up Session Storage

This is the fastest way to get up and running.  The app is set up so that it will store the User's *User ID, Access Token & Client Token* from their Servant account in cookies.  A potential downside is that any time the server is restarted, the user will need to Connect again via the Connect Servant button.  During development, this is kind of a pain, but the Connect process is quick and streamlined.  Further, your production application won't be restarted frequently.

Please note that we highly recommend getting an SSL certificate if you go this route.



## Deploying To Heroku:

Remember to set the following environment variables on your Heroku Server:
* NODE_ENV = production
* SERVANT_CLIENT_KEY = yourclientkey
* SERVANT_SECRET_KEY = yoursecretkey