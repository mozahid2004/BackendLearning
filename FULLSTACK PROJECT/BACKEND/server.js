import express from 'express';
// if we use import go in package.json and add  type = module

const app = express();

// app.get('/' , (req, res) => {
//   res.send('Server is ready')
// })

// get a list of 5 jokes

app.get('/api/jokes' , (req, res) => {

  const jokes = [
    {
      id: 1,
      title: "Why don't scientists trust atoms?",
      content: "Because they make up everything!"
    },
    {
      id: 2,
      title: "Why did the math book look sad?",
      content: "Because it had too many problems."
    },
    {
      id: 3,
      title: "What do you call fake spaghetti?",
      content: "An impasta!"
    },
    {
      id: 4,
      title: "Why did the scarecrow win an award?",
      content: "Because he was outstanding in his field!"
    },
    {
      id: 5,
      title: "What do you call cheese that isn't yours?",
      content: "Nacho cheese!"
    }
  ];
  
  res.send(jokes);

  
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
})

