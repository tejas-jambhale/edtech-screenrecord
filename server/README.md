# EDTech

## Authentication
## 
    POST: /auth/register
    DESC: Register user
##
    POST: /auth/login
    DESC: login user
##
    POST: /auth/logout
    DESC: logout user
##
## Recover Password Routes
##
    POST: /recovery/forgotpassword
    desc: Accepts email and sends link for reset password
##
    GET: /recovery/resetpassword/:token
    desc: Renders reset password form from the link in mail
##
    POST: /recovery/resetpassword
    desc: Resets password
##
## School Routes
##
    POST: /school/addclass
    DESC: add class
##
    GET: /school/classes
    DESC: get all classes
##
    DELETE: /school/delete/:classid
    DESC: delete class
##
    GET: /school/people
    DESC: Get all teachers and students in a school, based on verified query (true or false)
##
    POST: /school/people/:userId
    DESC: Verify a particular user based on userId and status, or verify all
##
    GET: /school/referral
    DESC: Get referral code for school
##
    POST: /school/referral
    DESC: Update the referral codes
##
## Teacher Routes
##
    POST: /teacher/schedule
    DESC: schedule class
##
    GET: /teacher/classes
    DESC: get all scheduled classes
##
    DELETE: /teacher/delete/:classId
    DESC: delete active class
##
    GET: /teacher/update/:activeclassid
    DESC: update scheduled class
##
    GET: /teacher/chime/:roomid
    DESC: aws
##

## Student Routes
##
    GET: /student/classes
    DESC: get all scheduled classes
##
## Video routes
##
    GET: /videos/:id
    DESC: Get a video
##
## Chime
##
    GET: /teacher/chime/:roomid
    DESC: aws
##