
import express = require('express')
import morgan = require('morgan')
import { MetricsHandler, Metric } from './metrics'
import { UserHandler, User } from './users'
import bodyparser = require('body-parser')
import session = require('express-session')
import levelSession = require('level-session-store')

const LevelStore = levelSession(session)

const app = express()
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))

const port: string = process.env.PORT || '8080'

app.listen(port, (err: Error) => {
  if (err) {
    throw err
  }
  console.log(`server is listening on port ${port}`)
})

var metrics : Metric[]
const dbUser: UserHandler = new UserHandler('./db/users')
const authRouter = express.Router()
app.use(authRouter)
const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index', { name: req.session.user.username })
})

authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})

authRouter.post('/login', (req: any, res: any, next: any) => {
  if(req.body.username == "" || req.body.password == "")
      res.status(401).send("Erreur : remplissez tous les champs")
  else{
      dbUser.get(req.body.username, (err: Error | null, result?: User) => {
          console.log(result)
          if (err || result === undefined || !result.validatePassword(req.body.password)) {
            res.status(401).send("Erreur : mdp our username incorrect")
          } else {
              req.session.loggedIn = true
              req.session.user = result
              console.log(req.session.user)
              // res.status(200).send
              res.redirect('/')
          }
      })}
    })


  const userRouter = express.Router()

  authRouter.post('/user', (req: any, res: any, next: any) => {
    const { username, email, password  } = req.body
    if(username== "" || email == "" || password == ""){
        res.status(401).send("Erreur : remplissez tous les champs")}
    else{
        const user = new User(username, email, password,false)
        dbUser.get(username,(err:Error|null,result?:User)=>{
            if(result != undefined){
              res.status(402).send("Erreur : mdp our username incorrect")
            }
            else{
                dbUser.save(user, (err: Error | null) => {
                    if (err){
                        res.status(404).send("Impossible de créer un compte, veuillez réessayer")
                    }
                    else
                        res.status(200).send("Nouveau compte créé. Veuillez vous connecter")
                        
                })}
        })
    }})


const metricsHandler = new MetricsHandler("./db/metrics")

app.get('/metrics', authCheck, (req: any, res: any) => {
  metricsHandler.get(req.session.user.username,(err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
    metrics = result
    res.render('metrics', {
      metrics : metrics
    })
  })
})

app.post('/metrics/new', authCheck, (req: any, res: any) => {
  if (req.body.timestamp == "" || req.body.value == "") res.status(401).send("merci de remplir tous les champs")
  metrics.push(req.body)
  metricsHandler.save(req.session.user.username, metrics,(err: Error | null, result?: any) => {
    if(err) throw err
    console.log('success save met')
    metricsHandler.get(req.session.user.username, (err: Error | null, result?: any) => {
      if (err) {
        throw err
      }
      console.log("rendu")
      console.log(result)
      if(result) metrics = result
      res.render('metrics', {
        metrics : metrics
      })
    })
  })
})


app.post('/metrics/delete', (req: any, res: any) => {
  console.log(req.body)
  metricsHandler.delete(req.session.user.username, req.body.timestamp, (err: Error | null, result?: any) => {
    if(err) throw err
    console.log('success del met')
    metricsHandler.get(req.session.user.username, (err: Error | null, result?: any) => {
      if (err) {
        throw err
      }
      console.log("rendu")
      console.log(result)
      if(result) metrics = result
      res.render('metrics', {
        metrics : metrics
      })
    })
  }) 
})

//Pour le dev
app.get('/metrics/all', authCheck, (req: any, res: any) => {
  metricsHandler.getAll((err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
})