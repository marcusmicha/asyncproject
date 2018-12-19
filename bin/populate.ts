#!/usr/bin/env ts-node

import { Metric, MetricsHandler } from '../src/metrics'
import { User, UserHandler } from '../src/users'
import { LevelDb } from './../src/leveldb'


const mets1 = [
  new Metric(`2013-11-04`, 12),
  new Metric(`2013-11-05`, 10),
  new Metric(`2013-11-06`, 8)
]

const mets2 = [
  new Metric(`2017-11-04`, 12),
  new Metric(`2017-11-07`, 10)
]

const user1 = new User("mmarcus", "m@gmail.com", "mmarcus")
const user2 = new User("ece", "ece@gmail.com", "ece")

LevelDb.clear("./db/metrics")
LevelDb.clear("./db/users")
const mh = new MetricsHandler("./db/metrics")
const uh = new UserHandler("./db/users")

uh.save(user1, (err: Error | null) => {
  if (err) throw err
    console.log('user1 ok')
    mh.save(user1.username, mets1, (err: Error | null) => {
      if (err) throw err
      console.log('met user1 ok')
  })
})

uh.save(user2, (err: Error | null) => {
  if (err) throw err
    console.log('user2 ok')
    mh.save(user2.username, mets2, (err: Error | null) => {
      if (err) throw err
      console.log('met user1 ok')
    })
})



