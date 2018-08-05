### Simple photostock application

#### API routes
- get('/getallimages')
- get('/image/:filename')
- post('/upload') - 'file'
- delete('/files/:id')

- get('/carousel/:id') - подгрузка 5 фотографий
- get('/carousel/:id?value=:val') - подгрузка val фотографий

##### New routes
- post('/register') - (username: email, name: username; password: password)
- post ('/login') - (username: email, password: password)
- post('/logout')

- get('/') - получить пользователя, если он залогинен

- get('/getallusers') - получить список всех пользователей
- get('/profile/:id') - получить пользователя по id
- get('/profile/:id/getallimages') - получить все фотографии пользователя
