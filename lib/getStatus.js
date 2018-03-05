const codeToName = require('./codeToName')
const { Api , Platform } = require('../models')
const { getApis } = require('../lib/getData')
const reformatData = require('../lib/reformatData')
const Promise = require('promise')
const { readData } = require('./checkData')

module.exports = (text) => {
  console.log('./lib/getStatus')
  return new Promise(( resolve,reject ) => {
    let { name,platformName } = JSON.parse(text)
    console.log(`name: ${name}`, `platformName: ${platformName}`)
    Platform.findOne({ name: platformName },(err,foundPlatform) => {
      if(err){resolve(err)}
      let getDataUrl = (foundPlatform.url+'/APIProxies?$select=name,life_cycle,state&$format=json')
      console.log('ln15:', `getDataUrl: ${getDataUrl}`)
      getApis(foundPlatform.username,foundPlatform.password,foundPlatform.url,getDataUrl)
      .then( (data) => {
        readData(data,foundPlatform.name)
        let apis = data.d.results.map(api => {
          return reformatData(api,foundPlatform.name)
        })
        let api = apis.filter(api => api.name.toLowerCase() === name.toLowerCase())[0]
        console.log('ln23:', api)
        if(!!api){
          codeToName(api.changed_by).then((name) => {
            let update = 'Api on platform:'+api.platformName+'\n name:'+api.name+'\n was changed by:'+name+'\n on:'+api.changed_at
            resolve(update)
          })
        } else {
          let list = apis.map(api =>  api.name)
          let update = 'Api not found we have the following Apis:'+list.join(' ')
          resolve(update)
        }
      })
      .catch((err) => console.log(err))
    })
  })
}