const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router()
const userSchema = require('../models/User')
const authorize = require('../middlewares/auth')
const { check, validationResult } = require('express-validator')

// Sign-up
router.post(
  '/register-user',  // /register-user pour l'ajout d'un utilisateur
  [
    check('prenom')
      .not()
      .isEmpty()
      .isLength({ min: 1 })
      .withMessage('Prenom court'),
    check('nom')
      .not()
      .isEmpty()
      .isLength({ min: 1 })
      .withMessage('Name must be atleast 3 characters long'), 
    check('role'), 
    check('etat'), 
    check('matricule'),   
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password should be between 5 to 8 characters long')
      .not()
      .isEmpty()
      .isLength({ min: 2, max: 8 }),
  ],
  (authorize, (req, res, next) => {
    const errors = validationResult(req)
    // console.log(req.body)

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    } else {
      bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new userSchema({
          prenom: req.body.prenom,
          nom: req.body.nom,
          email: req.body.email,
          role: req.body.role,
          etat: req.body.etat,
          date_inscription: req.body.date_inscription,
          matricule: req.body.matricule,
          password: hash,
        })
        user
          .save()
          .then((response) => {
            res.status(201).json({
              message: 'Utilisateur ajouté avec succé!',
              result: response,
            })
          })
          .catch((error) => {
            res.status(500).json({
              error: error,
            })
          })
      })
    }
  }
)
)
// Sign-in
router.post('/signin', (req, res, next) => {       //j'appelle ce route pour la connexion
  let getUser
  userSchema
    .findOne({
      email: req.body.email,
    })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Erreur d_authentification',
        })
      }
      getUser = user
      return bcrypt.compare(req.body.password, user.password)
    })
    .then((response) => {
      if (!response) {
        return res.status(401).json({
          message: 'Echec d_authentification',
        })
      }
      let jwtToken = jwt.sign(
        {
          email: getUser.email,
          userId: getUser._id,
        },
        'longer-secret-is-better',
        {
          expiresIn: '1h',
        },
      )
      res.status(200).json({
        token: jwtToken,
        expiresIn: 3600,
        _id: getUser._id,
      })
    })
    .catch((err) => {
      return res.status(401).json({
        message: 'Echec d_authentification',
      })
    })
})

// Get Users
router.route('/').get(authorize, (req, res, next) => {   //pour recupérer toute la base de donnée
  userSchema.find((error, response)=> {
    if (error) {
      return next(error)
    } else {
      return res.status(200).json(response)
    }
  })
})


// Get Single User
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
  userSchema.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.status(200).json({
        msg: data,
      })
    }
  })
})

// Update User
router.route('/update-user/:id').put((req, res, next) => {
  userSchema.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    (error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
        console.log('User successfully updated!')
      }
    },
  )
})

// Delete User
router.route('/delete-user/:id').delete((req, res, next) => {
  userSchema.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.status(200).json({
        msg: data,
      })
    }
  })
})

router.route('/read-user/:id').get((req, res, next) => {
  userSchema.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

router.route("/miseAJour/:id").put((req, res, next) => {
  userSchema.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    (error, data) => {
      if (error) {
        return next(error);

      } else {
        res.json(data);
        console.log("Mise à jour avec succés");
      }
    }
  );
});

//update_password
router.patch('/updateUser/:id', async(req, res) => {

  // console.log(req.params.id);
  try {
        let { actuelPass, newPass } = req.body;

        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };
        let user= userSchema.findById({"_id": req.params.id});
        if(!user){
          return res.status(404);
        };

        if (updatedData.actuelPass){
            user.then(async(e)=> {

                  if(await bcrypt.compare(actuelPass, e.password)){
                      const hash = await bcrypt.hash(newPass, 10);
                        updatedData.password = hash;
                        const result = await userSchema.findByIdAndUpdate(
                        id, updatedData, options
                        );
                    
                      return res.send(result);
                  }
                  return res.send('no corres');
            });   
    
        }else{
          const result = await userSchema.findByIdAndUpdate(
                id, updatedData, options
            )
    
            return res.send(result)
        }
        
        
        
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }

   

  
});

module.exports = router
