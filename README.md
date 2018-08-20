### Simple photostock application

#### API routes
- get('/getallimages')
- get('/image/:filename')
- delete('/files/:id')

- get('/carousel/:id') - подгрузка 5 фотографий
- get('/carousel/:id?value=:val') - подгрузка val фотографий

- post('/register') - (username: email, name: username; password: password)
- post ('/login') - (username: email, password: password)
- post('/logout')

- get('/') - получить пользователя, если он залогинен

- get('/getallusers') - получить список всех пользователей
- get('/profile/:id') - получить пользователя по id
- get('/profile/:id/getallimages') - получить все фотографии пользователя


- post('/profile/:id/changename') - смена имени пользователя (поле 'newname')
- post('/profile/:id/changemail') - смена почты пользователя (поле 'newmail')
- post('/findbyname') - поиск пользователя по имени (поле 'name')

- post('/upload') - 'file', 'author' (текстовое поле с id пользователя)
- post('/profile/:id/changepassword') - 'oldpassword', 'newpassword'
- post('/findbychar') - поиск пользователя по первым буквам имени (поле 'chars')
- post('/uploadavatar') - загрузка аватарка (поля 'file', 'author' (текстовое поле с id пользователя))

- app.get('/getallcomments') - получить все комменты
- app.get('/image/:filename/comment') - получить комменты по имени фотографии
- app.post('/image/:filename/comment') - запостить коммент по имени фотографии (поле 'comment')
- app.delete('/comment/:id') - удалить коммент по Id;
- app.put('/comment/:id') - редактировать коммент по Id (поле 'newcomment')

- app.post('/image/:filename/like') - поставить лайк
- app.delete('/image/:filename/like') - убрать лайк
- app.get('/getalllikes') - получить общий список лайков
- app.get('/image/:filename/like') - получить список лайков по фотографии

##### New routes (friendship)
- app.get('/friends') - получить список друзей залогиненного пользователя (возможные статусы - Pending, Accepted, Requested)
- app.post('/friends') - предложить или подтвердить дружбу (поле 'reqUser' с ID пользователя)
- app.delete('/friends') - удалить дружбу (поле 'reqUser' с ID пользователя)