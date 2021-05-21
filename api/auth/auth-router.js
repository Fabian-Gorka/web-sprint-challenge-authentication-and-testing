const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Users = require('../../users-model.js');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res) => {
  
  function isValid(user) {
    return Boolean(user.username && user.password && typeof user.password === "string");
  }
  if (isValid(req.body)) {
   try {
      const { username, password } = req.body;
      //gets these items from the request
      const hash = bcrypt.hashSync(password, 10); 
        //sets the hash for encrypting the password
      const user = { username, password: hash};
      //sets the user to be the username and a hashed password
      const addedUser = Users.add(user);
      res.json(addedUser);
      //adds the user into the database
    } catch (err) {
      res.status(500).json({ message: "username taken" });
    }
} else {
  res.status(400).json({
    message: "username and password required"
  })
}
});

router.post('/login', (req, res) => {
  
  const { username, password } = req.body;
 function isValid(user) {
   return Boolean(user.username && user.password && typeof user.password === "string");
 }
 if (isValid(req.body)) {
   Users.findBy({ username: username })
     .then(([user]) => {
       if (user && bcrypt.compareSync(password, user.password)) {
         const token = makeToken(user) // make token
         res.status(200).json({ message: "Welcome to our API", token }); // send it back
       } else {
         res.status(401).json({ message: "Invalid credentials" });
       }
     })
     .catch(error => {
       res.status(500).json({ message: error.message });
     });
 } else {
   res.status(400).json({
     message: "username and password required",
   });
 }
});

const { jwtSecret } = require('./secret.js');
function makeToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
    foo: 'bar',
  };
  const options = {
    expiresIn: '5 minutes',
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
