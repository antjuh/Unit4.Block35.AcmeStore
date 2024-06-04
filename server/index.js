const {
    client,
    createTables,
    createUser,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    createFavorite,
    createProduct,
    deleteFavorite
  } = require('./db');
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  app.get('/api/products', async(req, res, next)=> {
    try {
      res.send(await fetchProducts());
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.get('/api/users', async(req, res, next)=> {
    try {
      res.send(await fetchUsers());
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.get('/api/users/:id/favorites', async(req, res, next)=> {
    try {
      res.send(await fetchFavorites(req.params.id));
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.delete('/api/users/:userId/favorites/:id', async(req, res, next)=> {
    try {
      await deleteFavorite({ user_id: req.params.userId, id: req.params.id });
      res.sendStatus(204);
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.post('/api/users/:id/favorites', async(req, res, next)=> {
    try {
      res.status(201).send(await createFavorite({user_id: req.params.id, product_id: req.body.product_id}));
    }
    catch(ex){
      next(ex);
    }
  });
  
  const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('tables created');
    const [moe, lucy, larry, ethyl, lotion, soccerBall, computer, axe] = await Promise.all([
      createUser({ username: 'Moe', password: 'moe_pw'}),
      createUser({ username: 'Lucy', password: 'lucy_pw'}),
      createUser({ username: 'Larry', password: 'larry_pw'}),
      createUser({ username: 'Ethyl', password: 'ethyl_pw'}),
      createProduct({ name: 'Lotion'}),
      createProduct({ name: 'Soccer ball'}),
      createProduct({ name: 'Computer'}),
      createProduct({ name: 'Axe Body Spray'})
    ]);
  
    console.log(await fetchUsers());
    console.log(await fetchProducts());
  
    const favorites = await Promise.all([
      createFavorite({ user_id: moe.id, product_id: computer.id}),
      createFavorite({ user_id: moe.id, product_id: lotion.id}),
      createFavorite({ user_id: ethyl.id, product_id: soccerBall.id}),
      createFavorite({ user_id: ethyl.id, product_id: axe.id})
    ]);
    console.log(await fetchFavorites(moe.id));
    await deleteFavorite({ user_id: moe.id, id: favorites[0].id});
    console.log(await fetchFavorites(moe.id));

    console.log('data seeded');
  
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  
  }
  init();
  