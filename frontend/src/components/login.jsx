import { useState, useEffect } from 'react'
import { socket } from '../socket'
import moonscape from '../assets/moonscape(black).png'

const Login = ({ setMessage, setVisible }) => {
  const [signup, setSignup] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    socket.on('signupSuccess', (token) => {
      localStorage.setItem('token', token)
      setVisible((prev) => !prev)
    })
    socket.on('signupError', (error) => {
      console.log('Error generating the token', error)
    })

    socket.on('loginSuccess', (token) => {
      localStorage.setItem('token', token)
      setVisible((prev) => !prev)
    })
    socket.on('loginError', (error) => {
      console.log('Error generating the token', error)
    })

    return () => {
      socket.off('signupSuccess')
      socket.off('signupError')
      socket.off('loginSuccess')
      socket.off('loginError')
    }
  }, [setVisible])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage((prev) => ({ ...prev, user: formData.username }))

    if (formData.username.trim() === '') {
      alert("Name field can't be empty")
      return
    }
    if (signup && formData.email.trim() === '') {
      alert("Email field can't be empty for signup")
      return
    }

    socket.emit('newUser', formData)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setMessage((prev) => ({ ...prev, user: formData.username }))

    if (formData.username.trim() === '' || formData.password.trim() === '') {
      alert('Username and Password are required')
      return
    }

    socket.emit('login', formData)
  }
  const handleSubmitUsingEnter = (e) => {
    // console.log(e.target.value);
    if (e.target.value.trim() !== '') {
      if (e.key === 'Enter') {
        setMessage((prev) => ({ ...prev, user: formData.username }))

        if (formData.username.trim() === '') {
          alert("Name field can't be empty")
          return
        }
        if (signup && formData.email.trim() === '') {
          alert("Email field can't be empty for signup")
          return
        }

        socket.emit('newUser', formData)
      }
    }
  }
  return (
    <div className="p-3 fixed inset-0 flex justify-center items-center bg-custom-radial font-pop">
      <form
        onSubmit={signup ? handleSubmit : handleLogin}
        className="flex justify-center items-center flex-col p-12 rounded-xl bg-[rgba(255,255,255,0.4)]"
      >
        <img src={moonscape} alt="logo" className="mix-blend-multiply" />
        <input
          className="w-72 px-2 py-1 rounded-xl border-none outline-none mb-5"
          type="text"
          placeholder="Enter your username"
          value={formData.username}
          name="username"
          required
          onChange={handleChange}
          onKeyUp={handleSubmitUsingEnter}
        />
        {signup && (
          <input
            type="email"
            className="w-72 px-2 py-1 rounded-xl border-none outline-none mb-5"
            placeholder="Enter your email"
            value={formData.email}
            name="email"
            required
            onChange={handleChange}
            onKeyUp={handleSubmitUsingEnter}
          />
        )}
        <input
          type="password"
          className="w-72 px-2 py-1 rounded-xl border-none outline-none mb-5"
          placeholder="Enter your password"
          value={formData.password}
          name="password"
          required
          onChange={handleChange}
          onKeyUp={handleSubmitUsingEnter}
        />
        <p>
          {!signup ? 'New User? ' : 'Already have an account? '}
          <span
            onClick={() => setSignup((prev) => !prev)}
            className="cursor-pointer underline font-bold text-red-900"
          >
            Click Here
          </span>
        </p>
        <button
          type="submit"
          className="shadow-[0_0_1px_black] bg-red-900 border-none text-white rounded-md mt-3 px-4 py-1"
        >
          {signup ? 'Signup' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login
