fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@ocseafood.vn', password: 'admin' })
})
  .then(async res => {
    console.log('STATUS:', res.status);
    console.log('TEXT:', await res.text());
  })
  .catch(err => console.error(err));
