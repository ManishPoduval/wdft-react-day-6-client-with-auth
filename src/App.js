import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import MyNav from './components/MyNav'
import { Route, Switch, withRouter } from 'react-router-dom'
import TodoList from './components/TodoList'
import axios from 'axios'
import config from './config'
import TodoDetail from './components/TodoDetail'
import AddForm from './components/AddForm'
import EditForm from './components/EditForm'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'

function App(props) {
  
  const [todos, updateTodos] = useState([])
  const [user, updateUser] = useState(null) 
  const [error, updateError] = useState(null) 
  const [fetchingUser, updateFetchingUser] = useState(true)  


  //-------------------------------------------------------
  //---------This is where the magic happens---------------
  //-------------------------------------------------------
  // The code below will run as a conditional componentDidUpdate
  // it will run automatically whenever you update the 'todos' or the 'user' state

  useEffect(() => {
    props.history.push('/')
  }, [user, todos])
  
  //-------------------------------------------------------
  //-------------------------------------------------------
  //-------------------------------------------------------
  
  useEffect(() => {
    axios.get(`${config.API_URL}/api/todos`, {withCredentials: true})
      .then((response) => {
        updateTodos(response.data)
      })
      .catch(() => {
        console.log('Fecthing failed')
      })

    axios.get(`${config.API_URL}/api/user`, {withCredentials: true}) 
      .then((response) => {
        updateTodos(response.data)
        updateFetchingUser(false)
      })
      .catch((errorObj) => {
        updateFetchingUser(false)
        updateError(errorObj.response.data)
      })

  }, [])

  const handleSignUp = (e) => {
    e.preventDefault()
    const {username, email , password} = e.target
    let newUser = {
      username: username.value, 
      email: email.value, 
      password: password.value
    }
    
    axios.post(`${config.API_URL}/api/signup`, newUser, {withCredentials: true})
      .then((response) => {
        updateUser(response.data)
      })
      .catch(() => {
        console.log('SignUp failed')
      })
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    const { email , password} = e.target
    let newUser = {
      email: email.value, 
      password: password.value
    }

    axios.post(`${config.API_URL}/api/signin`, newUser, {withCredentials: true})
      .then((response) => {
        updateUser(response.data)
        updateError(null)
      })
      .catch((errorObj) => {
        updateError(errorObj.response.data)
      })
  }

  const handleLogout = () => {
    axios.post(`${config.API_URL}/api/logout`, {}, {withCredentials: true})
      .then(() => {
        updateUser(null)
      })
      .catch((errorObj) => {
        // the real error json is always is the .response.data 
        updateError(errorObj.response.data)
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    let name = event.target.name.value
    let description = event.target.description.value

    //1. Make an API call to the server side Route to create a new todo
    axios.post(`${config.API_URL}/api/create`, {
      name: name,
      description: description,
      completed: false,
    }, {withCredentials: true})
      .then((response) => {
          // 2. Once the server has successfully created a new todo, update your state that is visible to the user
          updateTodos([response.data, ...this.state.todos])
      })
      .catch((err) => {
        console.log('Create failed', err)
      })
  }

  const handleDelete = (todoId) => {
  //1. Make an API call to the server side Route to delete that specific todo
  axios.delete(`${config.API_URL}/api/todos/${todoId}`, {withCredentials: true})
    .then(() => {
       // 2. Once the server has successfully created a new todo, update your state that is visible to the user
        let filteredTodos = todos.filter((todo) => {
          return todo._id !== todoId
        })
        updateTodos(filteredTodos)
    })
    .catch((err) => {
      console.log('Delete failed', err)
    })
  }

  const handleEditTodo = (todo) => {
    axios.patch(`${config.API_URL}/api/todos/${todo._id}`, {
      name: todo.name,
      description: todo.description,
      completed: todo.completed,
    }, {withCredentials: true})
      .then(() => {
          let newTodos = todos.map((singleTodo) => {
              if (todo._id === singleTodo._id) {
                singleTodo.name  = todo.name
                singleTodo.description = todo.description
              }
              return singleTodo
          })
          updateTodos(newTodos) 
      })
      .catch((err) => {
        console.log('Edit failed', err)
      })

}

  // 
  if(fetchingUser){
    return <p>Loading . . . </p>
  }

  return (
    <div>
      <MyNav onLogout={handleLogout} user={user} />
      <h1>Shopping List</h1>
      <Switch>
          <Route exact path="/" render={() => {
              return <TodoList todos={todos} />
          }} />
          <Route  path="/todos/:todoId" render={(routeProps) => {
              return <TodoDetail user={user} onDelete={handleDelete} {...routeProps} />
          }} />
           <Route path="/add-form" render={() => {
              return <AddForm onAdd={handleSubmit} />
          }} />
          <Route  path="/todo/:todoId/edit" render={(routeProps) => {
              return <EditForm onEdit={handleEditTodo} {...routeProps}/>
          }} />
          <Route  path="/signin"  render={(routeProps) => {
            return  <SignIn error={error} onSignIn={handleSignIn}  {...routeProps}  />
          }}/>
          <Route  path="/signup"  render={(routeProps) => {
            return  <SignUp onSubmit={handleSignUp} {...routeProps}  />
          }}/>
      </Switch>
    </div>
  )
}

export default withRouter(App)



