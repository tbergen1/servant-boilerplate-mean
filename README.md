# Servant Boilerplate: MEAN Stack

A Servant Boilerplate Application already integrated with [Servant](https://www.servant.co) built on the MEAN (MongoDB, Express, Angular, Node) stack.  Use this to rapidly build Servant applications by starting with this boilerplate application.  It's what we use! –  The Servant Team

## Features:

* **Lean MEAN Stack:** There is very little bloat in this version of the MEAN stack.
* **User Management:** User Authentication via Servant is already built and ready to use.  Authentication libraries like Passport are not needed!
* **Single Page Application:** Architected to be a Single Page Application.
* **Database:** A MongoDB database is set-up and user records are stored automatically when a user connects their servants.
* **Webhooks:** Webhook integration is already set up.  Every time content is created/edited/destroyed on a Servant connected to this app, this app is notified.
* **Production Optimizations:** Minifies javascript files for use in production and more.
* **Servant Visual Elements:** Servant graphics, colors & fonts included for matching Servant's visual style


## Installation & Set-Up:

### Register Your Application On Servant:

Go to https://www.servant.co and register your application in the dashboard.  

Enter this Redirect URL: *http://localhost:8080/servant/callback*

### Deploying To Heroku:

Remember to set the following environment variables on your Heroku Server:
* NODE_ENV = production
* SERVANT_CLIENT_ID = yourclientkey
* SERVANT_SECRET_KEY = yoursecretkey

Use this command: 

    heroku config:set SERVANT_CLIENT_ID=yourclientkey

