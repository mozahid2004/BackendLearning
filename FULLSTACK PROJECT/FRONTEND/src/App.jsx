import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {

  const [Jokes, setJokes] = useState([])

  useEffect(() => {
    axios.get('/api/jokes')
      .then((response) => {
        setJokes(response.data)
      })
      .catch((error) => {
        console.log(error.name);
      })
  })

  return (
    <>
      <center>
        <h1>MOZAHID KA JOKES</h1>
        <p>JOKES: {Jokes.length}</p>
      </center>

      {Jokes.map((joke) => (
        <div className='jokesbOx' key={joke.id}>
          <h3>{joke.title}</h3>
          <p>{joke.content}</p>
        </div>
      ))}

    </>
  )
}

export default App
