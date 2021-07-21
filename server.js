const express = require("express");
const { check, validationResult } = require('express-validator');
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const Restaurant = require('./models/restaurant');
const Menu = require('./models/menu');
const MenuItem = require('./models/menuItem');

const initialiseDb = require('./initialiseDb');
initialiseDb();

const app = express();
const port = 3000;


const handlebars = expressHandlebars({
    handlebars : allowInsecurePrototypeAccess(Handlebars)
})


app.engine('handlebars', handlebars);
app.set('view engine', 'handlebars')

app.use(express.static(__dirname + '/public'));

app.use(express.json());

app.use(express.urlencoded());


const restaurantChecks = [
    check('name').not().isEmpty().trim().escape(),
    check('image').isURL(),
    check('name').isLength({ max: 50 })
]

app.get('/restaurants', async (req, res) => {
    const restaurants = await Restaurant.findAll({include:Menu});
    res.render('restaurants', {restaurants})
});

app.get('/restaurants/:id', async (req, res) => {
    const restaurants = await Restaurant.findByPk(req.params.id,{
        include:{
            model:Menu ,
            include:MenuItem
        }
    });
    console.log("Restaurants",restaurants)
    res.render("restaurant", { restaurants });
})

app.get('/new-restaurant-form', async (req, res) => {
    res.render('newRestaurant')
  })
  
  
  app.post('/new-restaurant', async (req,res) => {
    console.log(req.body)
    const newRestaurant = await Restaurant.create(req.body)
    const foundRestaurant = await Restaurant.findByPk(newRestaurant.id)
    if(foundRestaurant) {
      res.send('New restaurant has been added')
    } else {
      console.error('Restaurant not created')
    }
  })


app.post('/restaurants', restaurantChecks, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    await Restaurant.create(req.body);
    res.sendStatus(201);
});

app.delete('/restaurants/:id', async (req, res) => {
    await Restaurant.destroy({
        where: {
            id: req.params.id
        }
    });
    res.sendStatus(200);
});


app.put('/restaurants/:id', restaurantChecks, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    const restaurant = await Restaurant.findByPk(req.params.id);
    await restaurant.update(req.body);
    res.sendStatus(200);
});

app.patch('/restaurants/:id', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id);
    await restaurant.update(req.body);
    res.sendStatus(200);
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});