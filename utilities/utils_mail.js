const nodemailer = require('nodemailer');
  
// We only need to create the transport opbject once.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

function emailHandler(error, info) {
  if (error) {
    console.log('##############  BEGIN sendMail ERROR  ##############');
    console.log(error);
    console.log('##############  END sendMail ERROR  ##############');
  } else {
    console.log(info.response);
  }
}

// This method handles the sending of all emails
function sendEmail(from, receiver, subj, message) {
  
  // Build the email ooptions
  let mailOptions = {
    from: from,
    to: receiver,
    subject: subj,
    html: message
  };
  // Send the message
  transporter.sendMail(mailOptions, emailHandler);
}


function sendWelcomeEmail(firstName, email) {

  let welcomeSubject = "A refactored Welcome! ";
  let welcomeMessage = "<strong>A refactored Welcome to our app " + firstName + "!</strong>";

  sendEmail("admin@ourapp.com", email, welcomeSubject, welcomeMessage);
}


function sendVerificationEmail(firstName, email, request, token) {

  let subject = "Account Verification Token";
  
  let message = '<html>' +
                    '<body>' +
                      'Hello ' + firstName + ', please click to confirm your email address' + '<br><br>' +
                      '<form action = "http://' + request.headers.host + '/confirmation" method = "POST">' +
                          '<input type = "hidden" name="token" value="' + token.token + '"}">' +
                          '<input type = "submit" value = "Confirm">' +
                      '</form>' +
                    '</body>' +
                  '</html>';

  sendEmail("no-reply@ourapp.com", email, subject, message);
}

module.exports = {
  sendEmail, sendWelcomeEmail, sendVerificationEmail
}