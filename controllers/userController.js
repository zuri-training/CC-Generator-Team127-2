const User = require('../model/user.js');
const nodemailer = require('nodeMailer');
require('dotenv').config();

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { firstName: '', lastName: '', email: '', password: '', date_of_birth: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'Invalid email or password';
  }

  // incorrect email
  if (err.message === 'incorrect password') {
    errors.password = 'Invalid email pr password';
  }
  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// signin API
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
    // res.status(400).send(error);
  }
};

// signup API
exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, date_of_birth } = req.body;
  const user = new User({ firstName, lastName, email, password, date_of_birth });
  try {
    // save the user in the database
    await user.save();
    // generate token which will be used to check authenticated users
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
    // res.status(400).send(error);
  }
};

// routes API
exports.library = (req, res) => {
  res.render('library.ejs');
};

exports.index = (req, res) => {
  res.status(200).render('index.ejs');
};

(exports.about = (req, res) => {
  res.status(200).render('about.ejs');
}),
  (exports.contact = (req, res) => {
    res.status(200).render('contact.ejs');
  });

exports.signUp = (req, res) => {
  res.status(200).render('signup.ejs');
};

exports.signIn = (req, res) => {
  res.status(200).render('signin.ejs');
};

exports.downloadpage1 = (req, res) => {
  res.status(200).render('downloadpage1');
};

// Sending Email API
exports.sendEmail = (req, res) => {
  (fname = req.body.fname),
    (lname = req.body.lname),
    (tel = req.body.tel),
    (from = req.body.from),
    (subject = req.body.subject),
    (message = req.body.body);

  // create reusable transporter object using the default SMTP transport
  const Transporter = nodemailer.createTransport({
    host: process.env.host,
    port: 2525,
    auth: {
      user: process.env.user,
      pass: process.env.pass,
    },
  });

  // send mail with defined transport object
  let mailOptions = {
    from: `${from}`, // list of sender
    to: 'cc_team127@gmail.com', // list of receivers
    subject: `${subject}`, // Subject line
    text: `${message}`, // plain text body
    // html: "<b>Hello world?</b>", // html body
  };

  // Transporter.sendMail object
  Transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log('Error ' + err);
      res.status(500).send('Something went wrong.');
    } else {
      res.status(200).send('<h1>Email successfully!</h1>');
      console.log('Email sent successfully');
    }
  });
};